// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Replace 'Near-Me' with your repo name if it's different!
  base: '/Near-Me/',
});
