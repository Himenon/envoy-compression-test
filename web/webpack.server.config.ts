import * as webpack from "webpack";
import * as path from "path";

process.on("unhandledRejection", console.dir);

const config: webpack.Configuration = {
  mode: "development",
  target: "node",
  entry: {
    server: ["regenerator-runtime", "./src/server.ts"],
  },
  devtool: "inline-source-map",
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
    library: {
      type: "commonjs",
    },
    clean: true,
  },
  optimization: {
    minimize: false,
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader", // read .swcrc
        },
      },
    ],
  },
  resolve: {
    extensions: [".web.mjs", ".mjs", ".web.js", ".js", ".web.ts", ".ts", ".web.tsx", ".tsx", ".json", ".web.jsx", ".jsx"],
    modules: [path.join(__dirname, "src"), "node_modules", path.join(__dirname, "node_modules")],
  },
  externalsPresets: { node: true },
};

export default config;
