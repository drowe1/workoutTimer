function secsToClock(seconds) {
	let rem = seconds%60;
	let secs = rem.toString();
	if (rem < 10) {
		secs = '0' + secs;
	}
	return Math.floor(seconds/60)+":"+secs;
}

export { secsToClock }
