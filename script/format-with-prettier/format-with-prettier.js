const { formatWithPrettier } = require("../../dist/commonjs/main.js")
const jsenvConfig = require("../../jsenv.config.js")

formatWithPrettier({
  ...jsenvConfig,
})
