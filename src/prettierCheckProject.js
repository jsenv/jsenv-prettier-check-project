import { normalizePathname } from "@jsenv/module-resolution"
import {
  namedValueDescriptionToMetaDescription,
  selectAllFileInsideFolder,
} from "@dmail/project-structure"
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
    const projectPathname = normalizePathname(projectPath)
    const cancellationToken = createProcessInterruptionCancellationToken()

    const report = {}
    await selectAllFileInsideFolder({
      cancellationToken,
      pathname: projectPathname,
      metaDescription: namedValueDescriptionToMetaDescription({
        prettify: prettifyMap,
      }),
      predicate: (meta) => meta.prettify === true,
      transformFile: async ({ filenameRelative }) => {
        const { status, statusDetail } = await prettierCheckFile({
          projectPathname,
          fileRelativePath: `/${filenameRelative}`,
        })
        report[filenameRelative] = { status, statusDetail }

        if (status === STATUS_ERRORED) {
          if (logErrored) {
            console.log(createErroredFileLog({ filenameRelative, statusDetail }))
          }
          return
        }

        if (status === STATUS_IGNORED) {
          if (logIgnored) {
            console.log(createIgnoredFileLog({ filenameRelative }))
          }
          return
        }

        if (status === STATUS_UGLY) {
          if (logUgly) {
            console.log(createUglyFileLog({ filenameRelative }))
          }
          return
        }

        if (logPretty) {
          console.log(createPrettyFileLog({ filenameRelative }))
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
