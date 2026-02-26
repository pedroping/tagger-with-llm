import path from "node:path";
import { fileURLToPath } from "node:url";
import nodeExternals from "webpack-node-externals";
import CopyWebpackPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: "node",
  entry: "./index.js",
  externals: [nodeExternals()],
  mode: "production",
  output: {
    filename: "main.cjs",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "models",
          to: "models",
        },
      ],
    }),
  ],
};
