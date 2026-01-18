// eslint.config.js
import js from '@eslint/js';
import prettierConfig from "eslint-config-prettier";
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            react,
            'unused-imports': unusedImports,
        },
    },
]);
