import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig as any,
    defineConfig({
        test: {
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/*'],
            root: fileURLToPath(new URL('./', import.meta.url)),
            // @ts-ignore
            transformMode: {
                web: [/\.[jt]sx$/],
            },
        },
    }) as any
);
