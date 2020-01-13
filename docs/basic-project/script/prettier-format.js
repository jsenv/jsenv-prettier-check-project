const { resolve} = require('path')
const { formatWithPrettier } = require("@jsenv/prettier-check-project")

formatWithPrettier({
  projectDirectoryUrl: resolve(__dirname, '../')
})
