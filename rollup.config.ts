import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from "rollup-plugin-node-resolve";
// import { uglify } from "rollup-plugin-uglify";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'storax',
        globals: {
            react: 'react'
        }
    },
    plugins: [
        babel(),
        peerDepsExternal(),
        resolve(),
        commonjs(),
        // uglify()
    ],
    external: ['react']
}

// todo: ignore /src and gitignore