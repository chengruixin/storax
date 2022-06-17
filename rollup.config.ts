import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
        // name: 'storax'
    },
    plugins: [
        babel(),
        peerDepsExternal(),
        resolve({
            browser: true,
            dedupe: ['react']
        }),
        commonjs({
            namedExports: {
                'node_modules/react/index.js': ['useState', 'useEffect'],
            },
        }),
        uglify()
    ]
}

// todo: ignore /src and gitignore