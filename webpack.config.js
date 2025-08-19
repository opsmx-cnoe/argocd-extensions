const path = require('path');

module.exports = {
  mode: 'production',
  entry: './resources/extension-argonaut.js',
  output: {
    path: path.resolve(__dirname, 'asset/resources'),
    filename: 'extension-argonaut.js', 
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
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
  react: "React",
  "react-dom": "ReactDOM"
  }
};
