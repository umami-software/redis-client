import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/client.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'default'
      },
    ],
    plugins: [
      external(),
      resolve(),
      commonjs(),
      ts(),
      terser({
        format: {
          comments: false,
        },
      }),
    ],

    external: ['redis','debug'],
  },
];
