import { assert } from "@dmail/assert"
import { importMetaURLToFolderPath } from "@jsenv/operating-system-path"
import { prettierCheckProject } from "../../index.js"

const testFolderPath = importMetaURLToFolderPath(import.meta.url)
const actual = await prettierCheckProject({
  projectPath: testFolderPath,
  prettifyMap: {
    "/**/*": true,
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
    totalCount: 6,
    erroredCount: 1,
    ignoredCount: 0,
    uglyCount: 1,
    prettyCount: 4,
  },
}

assert({
  actual,
  expected,
})
