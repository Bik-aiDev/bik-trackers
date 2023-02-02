const path = require('path');
const { webpack , DefinePlugin} = require('webpack');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
    },
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader' }],
    },
    mode: 'production'
};