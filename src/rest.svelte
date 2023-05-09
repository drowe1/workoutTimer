<script>
	import { secsToClock } from './lib/format'
	import warnSrc from './lib/assets/blip.mp3'
	import startSrc from './lib/assets/start.mp3'
	import {Howl} from 'howler';

	let warn = new Howl({
		src: [warnSrc]
	});
	let startSound = new Howl({
		src: [startSrc]
	});

	let topTimer = 120; // The time that the timer will reset to
	$: topTimer_display = secsToClock(topTimer)
	let warning = 5;
	let timer = topTimer;
	$: timer_display = timer>0 ? secsToClock(timer) : secsToClock(-timer)
	let active = false;
	let soundOn = true;
	let customSelector = false;
	let intervalId;

	function isNumber(evt) {
		evt = (evt) ? evt : window.event;
		const charCode = (evt.which) ? evt.which : evt.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			evt.preventDefault();
		}
	}

	function start() {
		active = true;
		intervalId = setInterval(() => {
			if (active) {
				timer--;
				if (timer === warning) {
					warn.play();
				} else if (timer === 0) {
					startSound.play();
				}
			}
		}, 1000)
	}

	function stop() {
		clearInterval(intervalId);
		active = false;
	}

	function toggle() {
		if (active) {
			stop();
		}
		else{
			start();
		}
	}

	function restart() {
		clearInterval(intervalId);
		reset();
		start();
	}

	function reset() {
		active = false;
		timer = topTimer;
	}
</script>

<div class="flex m-auto justify-center">
	<h1 class="text-2xl font-bold text-center text-gray-100">warning:</h1>
	<select class="m-auto ml-0 mt-2 flex" bind:value={warning}>
		<option value={0}>none</option>
		<option value={2.5}>{secsToClock(2.5)}</option>
		<option value={5}>{secsToClock(5)}</option>
		<option value={7.5}>{secsToClock(7.5)}</option>
		<option value={10}>{secsToClock(10)}</option>
		<option value={12.5}>{secsToClock(12.5)}</option>
		<option value={15}>{secsToClock(15)}</option>
	</select>
</div>

<h1 class="text-9xl font-bold text-center text-gray-100 font-Droid">{timer_display}</h1>
<h1 class="text-2xl font-bold text-center text-gray-100 font-Droid">{topTimer_display}</h1>
<div class="flex m-auto justify-center w-96">
	<button disabled={active} class="bg-gray-100 w-1/5 h-12 my-1 mr-1 disabled:bg-gray-400" on:click={() => {topTimer = 30; restart()}}>0:30</button>
	<button disabled={active} class="bg-gray-100 w-1/5 h-12 my-1 mx-1 disabled:bg-gray-400" on:click={() => {topTimer = 60; restart()}}>1:00</button>
	<button disabled={active} class="bg-gray-100 w-1/5 h-12 my-1 mx-1 disabled:bg-gray-400" on:click={() => {topTimer = 90; restart()}}>1:30</button>
	<button disabled={active} class="bg-gray-100 w-1/5 h-12 my-1 mx-1 disabled:bg-gray-400" on:click={() => {topTimer = 120; restart()}}>2:00</button>
	<button disabled={active} class="bg-gray-100 w-1/5 h-12 my-1 ml-1 disabled:bg-gray-400" on:click={() => {customSelector = !customSelector}}>Custom</button>
</div>
<div class="flex m-auto justify-center w-96">
	<button disabled={active || timer === topTimer} class="bg-gray-100 w-1/4 h-12 my-1 mr-1 disabled:bg-gray-400" on:click={reset}>Reset</button>
	<button class="bg-gray-100 w-3/4 h-12 my-1 ml-1" on:click={toggle}>{!active ? "Start" : "Pause"}</button>
</div>

{#if customSelector}
	 <input class="flex m-auto" type="number" bind:value={topTimer} on:keypress={isNumber} inputmode="numeric" on:blur={() => {customSelector = false}}>
{/if}

<div class="flex m-auto justify-center w-96">
	<button class="bg-gray-100 w-full h-28 mt-48" on:click={restart}>Restart</button>
</div>

