// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://touchradio.eu',
    // Bottom mobile nav is otherwise covered by the toolbar hit-target (z-index 999999)
    devToolbar: {
        enabled: false,
    },
    vite: {
        build: {
            sourcemap: true,
        },
    },
});
