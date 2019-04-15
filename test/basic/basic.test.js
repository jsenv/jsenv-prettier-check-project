import { pathnameToDirname, hrefToPathname } from "@jsenv/module-resolution"
import { assert } from "@dmail/assert"
import { prettierCheckProject } from "../../index.js"

const testFolder = pathnameToDirname(hrefToPathname(import.meta.url))
const actual = await prettierCheckProject({
  projectFolder: testFolder,
  prettifyMetaMap: {
    "/**/*.js": true,
    "/basic.test.js": false,
  },
  logUgly: false,
  logErrored: false,
  logSummary: false,
  updateProcessExitCode: false,
})
const expected = {
  report: actual.report,
  summary: {
    totalCount: 3,
    erroredCount: 1,
    ignoredCount: 0,
    uglyCount: 1,
    prettyCount: 1,
  },
}

assert({
  actual,
  expected,
})
