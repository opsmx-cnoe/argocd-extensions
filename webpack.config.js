const path = require('path');

module.exports = {
  mode: 'production',
  entry: '/resources/extension-argonaut.js',
  output: {
    path: path.resolve(__dirname, 'asset/resources'),
    filename: 'extension-argonaut.js', // overwrite existing file
    library: {
      type: 'var',
      name: 'ExtensionArgonaut'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'] // inlines CSS into JS
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
