// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import netlify from '@astrojs/netlify'
import clerk from '@clerk/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [clerk(), react()],
  adapter: netlify({ edgeMiddleware: false }),
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },
});