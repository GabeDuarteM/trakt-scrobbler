import * as CleanWebpackPlugin from "clean-webpack-plugin"
import CopyWebpackPlugin from "copy-webpack-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"
import { join, resolve } from "path"
import * as UglifyJSPlugin from "uglifyjs-webpack-plugin"
import * as webpack from "webpack"

interface IMergedConfigParams {
  env: "prod" | "dev"
}

interface IPattern {
  from: string
  to?: string
}

function getMergedConfig({ env }: IMergedConfigParams): webpack.Configuration {
  const baseConfig = getBaseConfig()
  const specificConfig = getSpecificConfig(env, baseConfig)

  return { ...baseConfig, ...specificConfig }
}

function getPatterns(): IPattern[] {
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

function getBaseConfig(): webpack.Configuration {
  return {
    devtool: "source-map",
    entry: {
      inject: join(__dirname, "src", "inject.ts"),
      popup: join(__dirname, "src", "popup.ts"),
      successAuth: join(__dirname, "src", "successAuth.ts")
    },
    externals: {
      electron: "electron"
    },
    output: {
      filename: "[name].js",
      path: join(__dirname, "dist"),
      publicPath: "/"
    },
    plugins: [new CleanWebpackPlugin(["dist"]), CopyWebpackPlugin(getPatterns())],
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    }
  }
}

function getSpecificConfig(env: "prod" | "dev", baseConfig): webpack.Configuration {
  return env === "prod" ? getProdConfig(baseConfig) : getDevConfig(baseConfig)
}

function getProdConfig(baseConfig: webpack.Configuration): webpack.Configuration {
  return {
    module: {
      rules: [
        {
          test: /\.(t|j)s?$/,
          use: { loader: "awesome-typescript-loader" }
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
      ]
    },
    plugins: [
      ...(baseConfig.plugins as webpack.Plugin[]),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new UglifyJSPlugin({
        comments: false,
        compress: true,
        compressor: {
          screw_ie8: true,
          warnings: true
        }
      })
    ]
  }
}

function getDevConfig(baseConfig): webpack.Configuration {
  return {
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(t|j)s?$/,
          use: { loader: "awesome-typescript-loader" }
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
      ]
    },
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
