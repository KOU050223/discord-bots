// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import oxlint from 'eslint-plugin-oxlint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  oxlint.configs['flat/all'], // oxlint と重複するルールを無効化
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // oxlint で対応できない型情報が必要なルールのみ設定
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  {
    ignores: [
      '**/dist/**',
      'node_modules/**',
      '**/*.d.ts',
      '**/*.d.mts',
      '**/*.mjs',
      '**/tsdown.config.ts',
      'vitest.config.ts',
      'eslint.config.js',
    ],
  },
);
