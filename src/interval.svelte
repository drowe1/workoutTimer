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
	let start = new Howl({
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

	setInterval(() => {
		if (active) {
			timer--;
			if (timer === warning && state==="off") {
				if (soundOn) {
					warn.play()
				}
			} else if (timer === 0) {
				if (state === "off") {
					if (soundOn) {
						start.play();
					}
					startOn();
				} else {
					if (soundOn) {
						rest.play();
					}
					startOff();
				}
			}
		}
	}, 1000)

	function startOff() {
		state = "off";
		timer = off;
		if (off === 0) {
			startOn();
		}
	}

	function startOn() {
		state = "on";
		timer = on;
		if (on === 0) {
			startOff();
		}
	}

	function reset() {
		active = false;
		timer = off;
		state = "off";
	}

</script>

<div class="flex m-auto justify-center">
	<h1 class="text-2xl font-bold text-center text-gray-100">off:</h1>
	<select class="m-auto ml-0 mt-2 flex" disabled={active} bind:value={off}>
		<option value={0}>{secsToClock(0)}</option>
		<option value={5}>{secsToClock(5)}</option>
		<option value={10}>{secsToClock(10)}</option>
		<option value={15}>{secsToClock(15)}</option>
		<option value={20}>{secsToClock(20)}</option>
		<option value={30}>{secsToClock(30)}</option>
		<option value={40}>{secsToClock(40)}</option>
		<option value={50}>{secsToClock(50)}</option>
		<option value={60}>{secsToClock(60)}</option>
	</select>

	<h1 class="text-2xl font-bold text-center text-gray-100">on:</h1>
	<select class="m-auto ml-0 mt-2 flex" disabled={active} bind:value={on}>
		<option value={0}>{secsToClock(0)}</option>
		<option value={5}>{secsToClock(5)}</option>
		<option value={10}>{secsToClock(10)}</option>
		<option value={15}>{secsToClock(15)}</option>
		<option value={20}>{secsToClock(20)}</option>
		<option value={30}>{secsToClock(30)}</option>
		<option value={40}>{secsToClock(40)}</option>
		<option value={50}>{secsToClock(50)}</option>
		<option value={60}>{secsToClock(60)}</option>
	</select>
</div>
<h1 class="text-2xl font-bold text-center text-gray-100">{state}</h1>
<h1 class="text-9xl font-bold text-center text-gray-100 font-Droid">{timer_display}</h1>
<div class="flex m-auto justify-center">
	<button disabled={active || (timer === off && state === "off")} class="bg-gray-100 w-24 h-12 m-1 disabled:bg-gray-400" on:click={reset}>Reset</button>
	<button class="bg-gray-100 w-72 h-12 m-1" on:click={() => {active = !active}}>{!active ? "Start" : "Pause"}</button>
</div>

