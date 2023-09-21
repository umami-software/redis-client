import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

const external = ['redis', 'debug'];

export default [
  {
    input: 'src/client.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins: [resolve(), commonjs(), esbuild()],
    external,
  },
  {
    input: 'src/client.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
      },
    ],
    plugins: [dts()],
    external,
  },
];
