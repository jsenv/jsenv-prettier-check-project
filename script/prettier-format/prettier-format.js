const { formatWithPrettier } = require("@jsenv/prettier-check-project")
const jsenvConfig = require("../../jsenv.config.js")

formatWithPrettier({
  ...jsenvConfig,
  logPretty: true,
  logLevel: "debug",
})
