<script>
	import { secsToClock } from './lib/format'
	import restSrc from './lib/assets/beep.mp3'
	import warnSrc from './lib/assets/blip.mp3'
	import startSrc from './lib/assets/start.mp3'
	import {Howl} from 'howler';
	import { onDestroy, onMount } from 'svelte';

	// True while the circuit is being edited or run, so the parent can hide the timer type dropdown
	export let hideMode = false;

	let restSound = new Howl({ src: [restSrc] });
	let warn = new Howl({ src: [warnSrc] });
	let startSound = new Howl({ src: [startSrc] });

	const STORAGE_KEY = "workoutTimer.circuits";
	const COUNTDOWN = 5;
	const WARNING = 5;

	let nextId = 1;
	const newRow = (name = "", duration = 30, rest = 0) => ({ id: nextId++, name, duration, rest });

	// Preloaded workouts come from workouts.json next to the app; they are never saved or edited
	let presets = [];
	onMount(async () => {
		try {
			const res = await fetch(`${import.meta.env.BASE_URL}workouts.json`, { cache: "no-cache" });
			const data = await res.json();
			presets = data.workouts.map(w => ({ id: `preset:${w.name}`, name: w.name, rows: w.rows, builtin: true }));
		} catch (e) {}
	});

	function load() {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
			// Early versions stored a sample copy of the core workout; it's preloaded now
			if (Array.isArray(saved)) return saved.filter(c => !(c.id === 1 && c.name === "10 Minute Core Strength"));
		} catch (e) {}
		return [];
	}

	function save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
		} catch (e) {}
	}

	let circuits = load();
	let selectedId = "";
	let editing = false;
	let draft = null;
	let isNew = false;

	// Running state
	let running = false;
	let phase = "countdown"; // countdown | work | rest | done
	let idx = 0;
	let timer = COUNTDOWN;
	let active = false;
	let intervalId;

	$: allCircuits = [...presets, ...circuits];
	$: selected = allCircuits.find(c => c.id === selectedId);
	$: hideMode = editing || running;
	$: current = running && selected ? selected.rows[idx] : null;
	$: upcoming = running && selected ? selected.rows[phase === "countdown" ? 0 : idx + 1] : null;

	function edit() {
		draft = {
			id: selected.id,
			name: selected.name,
			rows: selected.rows.map(r => ({ ...r, id: nextId++ })),
		};
		isNew = false;
		editing = true;
	}

	function add() {
		draft = { id: Date.now(), name: "", rows: [newRow()] };
		isNew = true;
		editing = true;
	}

	function stopEditing() {
		const circuit = {
			id: draft.id,
			name: draft.name.trim() || "Untitled circuit",
			rows: draft.rows
				.filter(r => r.name.trim())
				.map(r => ({ name: r.name.trim(), duration: Math.max(1, Math.round(+r.duration || 0)), rest: Math.max(0, Math.round(+r.rest || 0)) })),
		};
		circuits = isNew ? [...circuits, circuit] : circuits.map(c => c.id === circuit.id ? circuit : c);
		selectedId = circuit.id;
		save();
		editing = false;
		draft = null;
	}

	function remove() {
		if (!confirm(`Delete "${draft.name || "this circuit"}"?`)) return;
		circuits = circuits.filter(c => c.id !== draft.id);
		selectedId = "";
		save();
		editing = false;
		draft = null;
	}

	function addRow() {
		draft.rows = [...draft.rows, newRow()];
	}

	function removeRow(i) {
		draft.rows = draft.rows.filter((_, j) => j !== i);
	}

	// Drag to reorder rows by the handle
	let listEl;
	let dragIndex = null;

	function dragStart(e, i) {
		e.preventDefault();
		dragIndex = i;
	}

	function dragMove(e) {
		if (dragIndex === null) return;
		const rows = listEl.querySelectorAll("[data-row]");
		for (let j = 0; j < rows.length; j++) {
			const r = rows[j].getBoundingClientRect();
			if (j !== dragIndex && e.clientY >= r.top && e.clientY <= r.bottom) {
				const moved = draft.rows.splice(dragIndex, 1)[0];
				draft.rows.splice(j, 0, moved);
				draft.rows = draft.rows;
				dragIndex = j;
				break;
			}
		}
	}

	function dragEnd() {
		dragIndex = null;
	}

	// Running
	function begin() {
		running = true;
		phase = "countdown";
		idx = 0;
		timer = COUNTDOWN;
		resume();
	}

	function resume() {
		active = true;
		clearInterval(intervalId);
		intervalId = setInterval(tick, 1000);
	}

	function pause() {
		clearInterval(intervalId);
		active = false;
	}

	function end() {
		pause();
		running = false;
	}

	function startWork() {
		phase = "work";
		timer = selected.rows[idx].duration;
		startSound.play();
	}

	function tick() {
		timer--;
		if (phase === "rest" && timer === WARNING && selected.rows[idx + 1].rest >= 15) {
			warn.play();
		}
		if (timer > 0) return;

		if (phase === "countdown") {
			idx = 0;
			startWork();
		} else if (phase === "work") {
			// Rest comes before an exercise, so the next row's rest is what plays now
			const rest = selected.rows[idx + 1]?.rest;
			if (idx === selected.rows.length - 1) {
				finish();
			} else if (rest > 0) {
				phase = "rest";
				timer = rest;
				restSound.play();
			} else {
				idx++;
				startWork();
			}
		} else if (phase === "rest") {
			idx++;
			startWork();
		}
	}

	function finish() {
		pause();
		phase = "done";
		timer = 0;
		restSound.play();
	}

	onDestroy(() => clearInterval(intervalId));
</script>

<svelte:window on:pointermove={dragMove} on:pointerup={dragEnd} on:pointercancel={dragEnd} />

{#if running}
	<div class="flex flex-col items-center mt-4 mx-4">
		<div class="h-12 flex items-center">
			{#if !active && phase !== "done"}
				<button class="ui-btn px-6 h-10" on:click={end}>End</button>
			{/if}
		</div>
		{#if phase === "done"}
			<h1 class="text-7xl font-bold text-center text-gray-100 mt-8">Done!</h1>
			<h2 class="text-2xl font-bold text-center text-gray-100 mt-4">{selected.name}</h2>
			<button class="ui-btn w-96 max-w-full h-12 mt-16" on:click={end}>Close</button>
		{:else}
			<h1 class="text-9xl font-bold text-center text-gray-100 font-Droid tabular-nums">{secsToClock(timer)}</h1>
			<h2 class="text-3xl font-bold text-center text-gray-100 mt-6 h-10">
				{#if phase === "countdown"}Get ready{:else if phase === "rest"}Rest{:else}{current.name}{/if}
			</h2>
			<h3 class="text-2xl text-center text-gray-300 mt-10 h-8">
				{#if upcoming}Next: {upcoming.name}{/if}
			</h3>
			<button class="ui-btn w-96 max-w-full h-12 mt-24" on:click={active ? pause : resume}>{active ? "Pause" : "Resume"}</button>
		{/if}
	</div>
{:else if editing}
	<div class="flex flex-col mx-auto w-full px-4 mt-3 max-w-md" style="height: calc(100dvh - 7rem)">
		<div class="flex items-center gap-2">
			<input class="ui-select flex-1 min-w-0 !cursor-text" type="text" placeholder="Circuit name" bind:value={draft.name} />
			<button class="ui-btn w-10 h-10 flex items-center justify-center shrink-0" title="Stop editing" aria-label="Stop editing" on:click={stopEditing}>
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
			</button>
		</div>

		<div class="grid grid-cols-[1.5rem_1fr_3.5rem_3.5rem_1.5rem] gap-x-2 text-sm text-gray-400 mt-4 px-1">
			<span></span><span>Exercise</span><span class="text-center">Dur.</span><span class="text-center">Rest</span><span></span>
		</div>
		<div class="flex-1 min-h-0 overflow-y-auto mt-1" bind:this={listEl}>
			{#each draft.rows as row, i (row.id)}
				<div data-row class="grid grid-cols-[1.5rem_1fr_3.5rem_3.5rem_1.5rem] gap-x-2 items-center py-1 px-1 rounded-lg {dragIndex === i ? 'bg-gray-600' : ''}">
					<span class="text-gray-200 cursor-grab touch-none flex justify-center" role="button" tabindex="-1" aria-label="Drag to reorder" on:pointerdown={(e) => dragStart(e, i)}>
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><circle cx="7" cy="5" r="1.7"/><circle cx="13" cy="5" r="1.7"/><circle cx="7" cy="10" r="1.7"/><circle cx="13" cy="10" r="1.7"/><circle cx="7" cy="15" r="1.7"/><circle cx="13" cy="15" r="1.7"/></svg>
					</span>
					<input class="ui-select !text-left min-w-0 !cursor-text" type="text" placeholder="Exercise" bind:value={row.name} />
					<input class="ui-select !px-1 min-w-0 !cursor-text" type="number" inputmode="numeric" min="1" bind:value={row.duration} />
					<input class="ui-select !px-1 min-w-0 !cursor-text" type="number" inputmode="numeric" min="0" bind:value={row.rest} />
					<button class="text-gray-400 hover:text-red-400 flex justify-center" aria-label="Remove row" on:click={() => removeRow(i)}>
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>
					</button>
				</div>
			{/each}
			<button class="ui-btn w-full h-10 mt-2 text-2xl leading-none" aria-label="Add row" on:click={addRow}>+</button>
		</div>
		<div class="flex gap-2 my-2">
			<button class="ui-btn flex-1 h-12" disabled>Start</button>
			{#if !isNew}
				<button class="ui-btn px-4 h-12" on:click={remove}>Delete</button>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center gap-2 mt-3">
		<select class="ui-select" bind:value={selectedId}>
			<option value="">Select Workout</option>
			{#each allCircuits as c}
				<option value={c.id}>{c.name}</option>
			{/each}
		</select>
		{#if selected && !selected.builtin}
			<button class="ui-btn w-10 h-10 flex items-center justify-center" title="Edit" aria-label="Edit circuit" on:click={edit}>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>
			</button>
		{/if}
	</div>

	{#if selected}
		<div class="flex flex-col mx-auto w-full px-4 mt-4 max-w-md" style="height: calc(100dvh - 11rem)">
			<div class="grid grid-cols-[1fr_3.5rem_3.5rem] gap-x-2 text-sm text-gray-400 px-2">
				<span>Exercise</span><span class="text-center">Dur.</span><span class="text-center">Rest</span>
			</div>
			<div class="flex-1 min-h-0 overflow-y-auto mt-1 rounded-lg bg-gray-700">
				{#each selected.rows as row}
					<div class="grid grid-cols-[1fr_3.5rem_3.5rem] gap-x-2 px-2 py-2 border-b border-gray-600 last:border-0 text-gray-100">
						<span>{row.name}</span>
						<span class="text-center tabular-nums">{row.duration}</span>
						<span class="text-center tabular-nums">{row.rest}</span>
					</div>
				{/each}
			</div>
			<button class="ui-btn w-full h-12 mt-3" disabled={!selected.rows.length} on:click={begin}>Start</button>
		</div>
	{:else}
		<div class="flex justify-center mt-3">
			<button class="ui-btn px-6 h-10" on:click={add}>Add New</button>
		</div>
	{/if}
{/if}
