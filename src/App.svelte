<script>
	import "../src/app.css";
	import Interval from "./interval.svelte";
	import Rest from "./rest.svelte";
	import Circuit from "./circuit.svelte";

	let mode = "Interval Timer"
	let hideMode = false;

</script>

<main>
	<h1 class="text-3xl font-bold text-center text-gray-100">Workout Timer</h1>
	{#if !hideMode}
	<select class="ui-select m-auto mt-3 block text-center" bind:value={mode}>
		<option value="Rest Timer">Rest Timer</option>
		<option value="Interval Timer">Interval Timer</option>
		<option value="Circuit Timer">Circuit Timer</option>
	</select>
	{/if}
	{#if mode == "Rest Timer"}
		<Rest/>
	{:else if  mode == "Interval Timer"}
		<Interval/>
	{:else if mode == "Circuit Timer"}
		<Circuit bind:hideMode/>
	{/if}
</main>

<style lang="postcss">
:global(html) {
	background-color: theme(colors.gray.800);
}
</style>

