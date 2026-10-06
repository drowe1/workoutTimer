/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
			'Russo-One': ['Russo One'],
			'Droid': ['DroidSansMono Nerd Font Regular', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
		},

		},
	},
	plugins: [],
}

