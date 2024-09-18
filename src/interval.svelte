<script>
	import { secsToClock } from './lib/format'
	import restSrc from './lib/assets/beep.mp3'
	import warnSrc from './lib/assets/blip.mp3'
	import startSrc from './lib/assets/start.mp3'
	import {Howl} from 'howler';

	let rest = new Howl({
		src: [restSrc]
	});
	let warn = new Howl({
		src: [warnSrc]
	});
	let startSound = new Howl({
		src: [startSrc]
	});

	let off = 5;
	let on = 15;
	let warning = 5;
	let timer = off;
	let state = "off"
	$: timer_display = secsToClock(timer)
	let active = false;
	let soundOn = true;
	let options = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 105, 120, 150, 180];
	let intervalId;

	function start() {
		active = true;
		intervalId = setInterval(() => {
			if (active) {
				timer--;
				if (timer === warning && state==="off") {
					if (soundOn) {
						warn.play()
					}
				} else if (timer === 0) {
					if (state === "off") {
						startOn();
					} else {
						startOff();
					}
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

	function startOff() {
		if (soundOn) {
			rest.play();
		}
		state = "off";
		timer = off;
		if (off === 0) {
			startOn();
		}
	}

	function startOn() {
		if (soundOn) {
			startSound.play();
		}
		state = "on";
		timer = on;
		if (on === 0) {
			startOff();
		}
	}

	function reset() {
		stop();
		timer = off;
		state = "off";
	}

</script>

<div class="flex m-auto justify-center">
	<h1 class="text-2xl font-bold text-center text-gray-100">on:</h1>
	<select class="m-auto ml-0 mt-2 flex" disabled={active} bind:value={on}>
		{#each options as opt}
			<option value={opt}>{secsToClock(opt)}</option>
		{/each}
	</select>

	<h1 class="text-2xl font-bold text-center text-gray-100">off:</h1>
	<select class="m-auto ml-0 mt-2 flex" disabled={active} bind:value={off}>
		{#each options as opt}
			<option value={opt}>{secsToClock(opt)}</option>
		{/each}
	</select>
</div>
<h1 class="text-2xl font-bold text-center text-gray-100">{state}</h1>
<h1 class="text-9xl font-bold text-center text-gray-100 font-Droid">{timer_display}</h1>
<div class="flex m-auto justify-center w-96">
	<button disabled={active || (timer === off && state === "off")} class="bg-gray-100 w-[23.6%] h-12 m-1 disabled:bg-gray-400" on:click={reset}>Reset</button>
	<button class="bg-gray-100 w-3/4 h-12 m-1" on:click={toggle}>{!active ? "Start" : "Pause"}</button>
</div>
{#if !active && timer > 6 && state=="off"}
<div class="flex m-auto w-96">
	<button class="bg-gray-100 w-[22.9%] h-12 m-1" on:click={() => {timer = 5; start();}}>Countdown</button>
</div>
{/if}
