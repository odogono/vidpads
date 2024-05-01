/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [eslintPlugin(), react()]
});
