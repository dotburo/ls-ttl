import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default [
    // ES6 bundled module
    {
        input: 'src/index.js',
        output: [
            {
                file: pkg.main,
                format: 'es',
                name: 'Ls'
            }
        ],
        watch: {
            exclude: ['node_modules/**']
        },
        external: ['idb', 'query-string'],
        plugins: [
            terser()
        ]
    },
    // Browser-compatible bundle including all external dependencies.
    {
        input: 'src/index.js',
        output: [
            {
                file: 'dist/browser.js',
                format: 'iife',
                name: 'Ls',
                sourcemap: true
            }
        ],
        watch: {
            exclude: ['node_modules/**']
        },
        plugins: [
            nodeResolve(),
            commonjs()
        ]
    }
];
