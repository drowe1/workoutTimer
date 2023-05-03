<script>
	import "../src/app.css";
	import Interval from "./interval.svelte";
	import Rest from "./rest.svelte";

	let mode = "Rest Timer"

</script>

<main>
	<h1 class="text-3xl font-bold text-center text-gray-100">Workout Timer</h1>
	<select class="m-auto mt-2 flex" bind:value={mode}>
		<option value="Rest Timer">Rest Timer</option>
		<option value="Interval Timer">Interval Timer</option>
	</select>
	{#if mode == "Rest Timer"}
		<Rest/>
	{:else if  mode == "Interval Timer"}
		<Interval/>
	{/if}
</main>

<style lang="postcss">
:global(html) {
	background-color: theme(colors.gray.800);
}
</style>

