import webpack from "webpack"
import { join, resolve } from "path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import CleanWebpackPlugin from "clean-webpack-plugin"
import CopyWebpackPlugin from "copy-webpack-plugin"

function getMergedConfig({ env }) {
  const baseConfig = getBaseConfig()
  const specificConfig = getSpecificConfig(env, baseConfig)
  return { ...baseConfig, ...specificConfig }
}

function getPatterns() {
  return [
    { from: "_locales", to: "_locales" },
    { from: "icons", to: "icons" },
    { from: "src/popup.html" },
    { from: "src/popup.css" },
    { from: "src/successAuth.html" },
    { from: "src/successAuth.css" },
    { from: "manifest.json" }
  ]
}

function getBaseConfig() {
  return {
    devtool: "source-map",
    entry: {
      inject: ["babel-polyfill", resolve("src", "inject.js")],
      popup: resolve("src", "popup.js"),
      successAuth: resolve("src", "successAuth.js")
    },
    plugins: [new CleanWebpackPlugin(["dist"]), new CopyWebpackPlugin(getPatterns())],
    output: {
      path: join(__dirname, "dist"),
      filename: "[name].js",
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: "babel-loader",
              options: {
                babelrc: false,
                presets: [["es2015", { modules: false }], "stage-0"]
              }
            }
          ]
        }
      ]
    }
  }
}

function getSpecificConfig(env, baseConfig) {
  return env === "prod" ? getProdConfig(baseConfig) : getDevConfig(baseConfig)
}

function getProdConfig(baseConfig) {
  return {
    plugins: [
      ...baseConfig.plugins,
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: true,
          screw_ie8: true
        },
        comments: false,
        compress: true
      })
    ]
  }
}

function getDevConfig(baseConfig) {
  return {
    plugins: [
      ...baseConfig.plugins,
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development")
        }
      }),
      new webpack.NamedModulesPlugin()
    ]
  }
}

export default getMergedConfig
