import * as webpack from "webpack"
import { join, resolve } from "path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import * as CleanWebpackPlugin from "clean-webpack-plugin"
import CopyWebpackPlugin from "copy-webpack-plugin"
import * as UglifyJSPlugin from "uglifyjs-webpack-plugin"

type MergedConfigParams = {
  env: "prod" | "dev"
}

type Pattern = {
  from: string
  to?: string
}

function getMergedConfig({ env }: MergedConfigParams): webpack.Configuration {
  const baseConfig = getBaseConfig()
  const specificConfig = getSpecificConfig(env, baseConfig)
  return { ...baseConfig, ...specificConfig }
}

function getPatterns(): Pattern[] {
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
    entry: {
      inject: join(__dirname, "src", "inject.ts"),
      popup: join(__dirname, "src", "popup.ts"),
      successAuth: join(__dirname, "src", "successAuth.ts")
    },
    plugins: [new CleanWebpackPlugin(["dist"]), CopyWebpackPlugin(getPatterns())],
    output: {
      path: join(__dirname, "dist"),
      filename: "[name].js",
      publicPath: "/"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    },
    externals: {
      electron: "electron"
    }
  }
}

function getSpecificConfig(env: "prod" | "dev", baseConfig): webpack.Configuration {
  return env === "prod" ? getProdConfig(baseConfig) : getDevConfig(baseConfig)
}

function getProdConfig(baseConfig: webpack.Configuration): webpack.Configuration {
  return {
    devtool: "source-map",
    plugins: [
      ...(baseConfig.plugins as webpack.Plugin[]),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new UglifyJSPlugin({
        compressor: {
          warnings: true,
          screw_ie8: true
        },
        comments: false,
        compress: true
      })
    ],
    module: {
      rules: [
        {
          test: /\.(t|j)s?$/,
          use: { loader: "awesome-typescript-loader" }
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
      ]
    }
  }
}

function getDevConfig(baseConfig): webpack.Configuration {
  return {
    devtool: "source-map",
    plugins: [
      ...baseConfig.plugins,
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development")
        }
      }),
      new webpack.NamedModulesPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.(t|j)s?$/,
          use: { loader: "awesome-typescript-loader" },
          exclude: /node_modules/
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
      ]
    }
  }
}

export default getMergedConfig
