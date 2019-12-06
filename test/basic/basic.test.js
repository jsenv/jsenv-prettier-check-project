import { assert } from "@jsenv/assert"
import { prettierCheckProject, jsenvProjectFilesConfig } from "../../index.js"

const testDirectoryUrl = import.meta.resolve("./")

const actual = await prettierCheckProject({
  projectDirectoryUrl: testDirectoryUrl,
  projectFilesConfig: {
    ...jsenvProjectFilesConfig,
    "./basic.test.js": false,
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
assert({ actual, expected })
