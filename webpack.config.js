const path = require('path');

module.exports = {
  mode: 'production',
  entry:  path.resolve(__dirname, 'resources/extension-argonaut.js'), 
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension-argonaut.js', 
    library: {
      type: 'var',
      name: 'ExtensionArgonaut'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',   
              '@babel/preset-react'  
            ]
          }
        }
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
