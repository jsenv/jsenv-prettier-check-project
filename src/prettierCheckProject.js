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

export const prettierCheckProject = ({
  projectFolder,
  prettifyDescription,
  logErrored = true,
  logIgnored = false,
  logUgly = true,
  logPretty = false,
  logSummary = true,
  updateProcessExitCode = true,
}) =>
  catchAsyncFunctionCancellation(async () => {
    projectFolder = normalizePathname(projectFolder)
    const cancellationToken = createProcessInterruptionCancellationToken()

    const report = {}
    await selectAllFileInsideFolder({
      cancellationToken,
      pathname: projectFolder,
      metaDescription: namedValueDescriptionToMetaDescription({
        prettify: prettifyDescription,
      }),
      predicate: (meta) => meta.prettify === true,
      transformFile: async ({ filenameRelative }) => {
        const { status, statusDetail } = await prettierCheckFile({
          projectFolder,
          filenameRelative,
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

    if (updateProcessExitCode) {
      if (summary.erroredCount > 0 || summary.uglyCount > 0) {
        process.exitCode = 1
      } else {
        process.exitCode = 0
      }
    }

    return { report, summary }
  })

const summarizeReport = (report) => {
  const filenameRelativeArray = Object.keys(report)

  const erroredArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_ERRORED,
  )
  const ignoredArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_IGNORED,
  )
  const uglyArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_UGLY,
  )
  const prettyArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_PRETTY,
  )

  return {
    totalCount: filenameRelativeArray.length,
    erroredCount: erroredArray.length,
    ignoredCount: ignoredArray.length,
    uglyCount: uglyArray.length,
    prettyCount: prettyArray.length,
  }
}
