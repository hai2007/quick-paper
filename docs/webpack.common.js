const QuickPaperLoaderPlugin = require('../loader-plug/index.js');
const resolve = require('path').resolve;

module.exports = {
    entry: ['./src/entry.js'],
    output: {
        path: __dirname,
        filename: 'build/main.v8.js'
    },
    resolve: {
        alias: {
            'quick-paper': resolve(__dirname, '../dist/quick-paper.babel.js')
        }
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        }, {
            test: /\.paper$/,
            exclude: /node_modules/,
            loader: ['../loader/index.js']
        }, {
            test: /\.(png|jpg|jpeg|gif|bmp)$/,
            loader: [{
                loader: "url-loader",
                options: {
                    name: "build/[path][name].[ext]",
                    context: "src/asset",
                    limit: 5000
                }
            }]
        }, {
            test: /\.(css|scss)$/,
            loader: ['../style-loader/index.js', 'css-loader', 'postcss-loader', './scss-loader.js']
        }]
    },
    plugins: [
        new QuickPaperLoaderPlugin()
    ]
};
