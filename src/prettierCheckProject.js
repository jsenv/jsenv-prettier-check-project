import { operatingSystemPathToPathname } from "@jsenv/operating-system-path"
import { namedValueDescriptionToMetaDescription } from "@dmail/project-structure"
import { matchAllFileInsideFolder } from "@dmail/filesystem-matching"
import {
  catchAsyncFunctionCancellation,
  createProcessInterruptionCancellationToken,
} from "./cancellationHelper.js"
import { STATUS_ERRORED, STATUS_IGNORED, STATUS_UGLY, STATUS_PRETTY } from "./STATUS.js"
import { prettierCheckFile } from "./prettierCheckFile.js"
import {
  createErroredFileLog,
  createIgnoredFileLog,
  createUglyFileLog,
  createPrettyFileLog,
  createSummaryLog,
} from "./log.js"
import { jsenvPrettifyMap } from "./jsenv-prettify-map.js"

export const prettierCheckProject = async ({
  projectPath,
  prettierIgnoreRelativePath = "/.prettierignore",
  prettifyMap = jsenvPrettifyMap,
  logErrored = true,
  logIgnored = false,
  logUgly = true,
  logPretty = false,
  logSummary = true,
  updateProcessExitCode = true,
  throwUnhandled = true,
}) => {
  if (typeof projectPath !== "string")
    throw new TypeError(`projectPath must be a string, got ${projectPath}`)
  if (typeof prettifyMap !== "object")
    throw new TypeError(`prettifyMap must be an object, got ${prettifyMap}`)

  const start = async () => {
    const projectPathname = operatingSystemPathToPathname(projectPath)
    const cancellationToken = createProcessInterruptionCancellationToken()

    const report = {}
    await matchAllFileInsideFolder({
      cancellationToken,
      folderPath: projectPath,
      metaDescription: namedValueDescriptionToMetaDescription({
        prettify: prettifyMap,
      }),
      predicate: (meta) => meta.prettify === true,
      matchingFileOperation: async ({ relativePath }) => {
        const { status, statusDetail } = await prettierCheckFile({
          projectPathname,
          fileRelativePath: relativePath,
          prettierIgnoreRelativePath,
        })
        report[relativePath] = { status, statusDetail }

        if (status === STATUS_ERRORED) {
          if (logErrored) {
            console.log(createErroredFileLog({ relativePath, statusDetail }))
          }
          return
        }

        if (status === STATUS_IGNORED) {
          if (logIgnored) {
            console.log(createIgnoredFileLog({ relativePath }))
          }
          return
        }

        if (status === STATUS_UGLY) {
          if (logUgly) {
            console.log(createUglyFileLog({ relativePath }))
          }
          return
        }

        if (logPretty) {
          console.log(createPrettyFileLog({ relativePath }))
        }
      },
    })

    const summary = summarizeReport(report)
    if (logSummary) {
      console.log(createSummaryLog(summary))
    }

    return { report, summary }
  }
  const promise = catchAsyncFunctionCancellation(start)

  if (throwUnhandled) {
    promise.catch((e) => {
      setTimeout(() => {
        throw e
      })
    })
  }

  if (!updateProcessExitCode) return promise
  const { report, summary } = await promise
  if (updateProcessExitCode) {
    if (summary.erroredCount > 0 || summary.uglyCount > 0) {
      process.exitCode = 1
    } else {
      process.exitCode = 0
    }
  }
  return { report, summary }
}

const summarizeReport = (report) => {
  const fileArray = Object.keys(report)

  const erroredArray = fileArray.filter((file) => report[file].status === STATUS_ERRORED)
  const ignoredArray = fileArray.filter((file) => report[file].status === STATUS_IGNORED)
  const uglyArray = fileArray.filter((file) => report[file].status === STATUS_UGLY)
  const prettyArray = fileArray.filter((file) => report[file].status === STATUS_PRETTY)

  return {
    totalCount: fileArray.length,
    erroredCount: erroredArray.length,
    ignoredCount: ignoredArray.length,
    uglyCount: uglyArray.length,
    prettyCount: prettyArray.length,
  }
}
