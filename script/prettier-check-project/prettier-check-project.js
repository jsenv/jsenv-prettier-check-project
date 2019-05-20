const { prettierCheckProject } = require("@jsenv/prettier-check-project")
const { projectPath } = require("../../jsenv.config.js")

prettierCheckProject({
  projectFolder: projectPath,
  prettifyMetaMap: {
    // js
    "/index.js": true,
    "/src/**/*.js": true,
    "/test/**/*.js": true,
    "/script/**/*.js": true,
    "/**/**syntax-error**.js": false,
    "/**/.dist/": false,
    "/**/dist/": false,
    // json
    "/src/**/*.json": true,
    "/test/**/*.json": true,
    "/script/**/*.json": true,
    // md
    "/readme.md": true,
    "/doc/**.md": true,
    "/src/**/*.md": true,
    "/test/**/*.md": true,
    "/script/**/*.md": true,

    "/test/basic/errored.js": false,
    "/test/basic/ugly.js": false,
  },
})
