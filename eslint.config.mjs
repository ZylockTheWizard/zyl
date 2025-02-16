import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import stylistic from '@stylistic/eslint-plugin'


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}']},
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        'settings': {
            'react': {
                'version': 'detect'
            }
        }
    },
    {
        plugins: {
            '@stylistic': stylistic
        }
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@stylistic/indent': ['error', 4],
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/max-len': ['error', { 'code': 100 }],
            '@stylistic/quotes': ['error', 'single']
        }
    }
]