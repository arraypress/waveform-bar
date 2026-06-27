import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		// A concrete (non-opaque) origin so localStorage / sessionStorage are
		// available — the bar persists volume + queue state through them.
		environmentOptions: {
			jsdom: { url: 'http://localhost/' },
		},
		globals: true,
		include: ['test/**/*.test.js'],
		setupFiles: ['./test/setup.js'],
	},
});
