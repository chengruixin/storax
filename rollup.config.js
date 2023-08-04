import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import external from 'rollup-plugin-peer-deps-external';
const packageJson = require("./package.json");

export default {
    input: 'src/index_react.js',
    output: [
        {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: packageJson.module,
            format: "esm",
            sourcemap: true
        }
    ],
    plugins: [
        external(),
        resolve(),
        commonjs(),

        babel(),
        // uglify()
    ],
    external: ['react', 'react-dom']
}

//    "main": "dist/cjs/index.js",
//   "module": "dist/esm/index.js",
