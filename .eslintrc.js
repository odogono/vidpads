module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'airbnb',
        'prettier'
    ],
    ignorePatterns: ['dist'],
    parser: '@typescript-eslint/parser',
    plugins: ['prettier', 'react', 'react-hooks', 'react-refresh'],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true }
        ],
        'sort-imports': [
            'error',
            {
                ignoreCase: true,
                ignoreDeclarationSort: true
            }
        ],
        'import/order': [
            1,
            {
                groups: [
                    'external',
                    'builtin',
                    'internal',
                    'sibling',
                    'parent',
                    'index'
                ]
            }
        ],
        'prettier/prettier': ['error'],
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }]
    }
};
