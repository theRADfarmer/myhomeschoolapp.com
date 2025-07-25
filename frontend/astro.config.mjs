// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import node from '@astrojs/node'
import clerk from '@clerk/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [clerk(), react()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },
});