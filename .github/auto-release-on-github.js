const { fileURLToPath } = require("url")
const { autoReleaseOnGithub } = require("@jsenv/auto-publish")
const { projectDirectoryUrl } = require("../jsenv.config.js")

autoReleaseOnGithub({
  projectPath: fileURLToPath(projectDirectoryUrl),
})
