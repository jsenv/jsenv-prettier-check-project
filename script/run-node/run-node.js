const { execute, launchNode } = require("@jsenv/core")
const { projectPath } = require("../../jsenv.config.js")
const { getFromProcessArguments } = require("./getFromProcessArguments.js")

const filenameRelative = getFromProcessArguments("file")

execute({
  projectFolder: projectPath,
  launch: launchNode,
  fileRelativePath: `/${filenameRelative}`,
  mirrorConsole: true,
})
