const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "extension-argonaut": path.resolve(__dirname, "main/extension-argonaut.js"),
  },
  output: {
    path: path.resolve(__dirname, "resources"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM"
  }
};
