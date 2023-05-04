<script>
	import { secsToClock } from './lib/format'
	import warnSrc from './lib/assets/blip.mp3'
	import startSrc from './lib/assets/start.mp3'
	import {Howl} from 'howler';

	let warn = new Howl({
		src: [warnSrc]
	});
	let start = new Howl({
		src: [startSrc]
	});

	let topTimer = 120; // The time that the timer will reset to
	$: topTimer_display = secsToClock(topTimer)
	let warning = 5;
	let timer = topTimer;
	$: timer_display = timer>0 ? secsToClock(timer) : secsToClock(-timer)
	let active = false;
	let soundOn = true;

	setInterval(() => {
		if (active) {
			timer--;
			if (timer === warning) {
				warn.play();
			} else if (timer === 0) {
				start.play();
			}
		}
	}, 1000)

	function restart() {
		reset();
		active = true;
	}

	function reset() {
		active = false;
		timer = topTimer;
	}
</script>

<h1 class="text-2xl font-bold text-center text-gray-100 font-Droid">{topTimer_display}</h1>
<h1 class="text-9xl font-bold text-center text-gray-100 font-Droid">{timer_display}</h1>
<div class="flex m-auto justify-center w-96">
	<button disabled={active} class="bg-gray-100 w-1/4 h-12 my-1 mr-1 disabled:bg-gray-400" on:click={() => {topTimer = 30; restart()}}>0:30</button>
	<button disabled={active} class="bg-gray-100 w-1/4 h-12 my-1 mx-1 disabled:bg-gray-400" on:click={() => {topTimer = 60; restart()}}>1:00</button>
	<button disabled={active} class="bg-gray-100 w-1/4 h-12 my-1 mx-1 disabled:bg-gray-400" on:click={() => {topTimer = 90; restart()}}>1:30</button>
	<button disabled={active} class="bg-gray-100 w-1/4 h-12 my-1 ml-1 disabled:bg-gray-400" on:click={() => {topTimer = 120; restart()}}>2:00</button>
</div>
<div class="flex m-auto justify-center w-96">
	<button disabled={active || timer === topTimer} class="bg-gray-100 w-[23.6%] h-12 my-1 mr-1 disabled:bg-gray-400" on:click={reset}>Reset</button>
	<button class="bg-gray-100 w-3/4 h-12 my-1 ml-1" on:click={() => {active = !active}}>{!active ? "Start" : "Pause"}</button>
</div>
<div class="flex m-auto justify-center w-96">
	<button class="bg-gray-100 w-full h-28 mt-56" on:click={restart}>Restart</button>
</div>

