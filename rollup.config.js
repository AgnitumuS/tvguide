import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/main.js',
    dest: 'dist/main.js',
    plugins: [ babel() ],
    format: 'umd'
};