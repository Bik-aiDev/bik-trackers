const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        "index": path.resolve(__dirname, 'src/index.ts')
    },
    output: {
        chunkFilename: '[name].js',
        filename: '[name].js'
    },
    devtool: 'source-map',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: ['/node_modules/', '/test/'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            }
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()], // Uglify alternative
    },
    resolve: { extensions: ['.ts'] },
};