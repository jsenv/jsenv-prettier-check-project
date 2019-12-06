const { fileURLToPath } = require("url")
const { prettierCheckProject } = require("@jsenv/prettier-check-project")
const { projectDirectoryUrl } = require("../../jsenv.config.js")

prettierCheckProject({
  projectPath: fileURLToPath(projectDirectoryUrl),
})
