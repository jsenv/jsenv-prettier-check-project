const { prettierCheckProject, jsenvPrettifyMap } = require("@jsenv/prettier-check-project")
const { projectPath } = require("../../jsenv.config.js")

prettierCheckProject({
  projectPath,
  prettifyMap: {
    ...jsenvPrettifyMap,
    "/test/basic/errored.js": false,
    "/test/basic/ugly.js": false,
  },
})
