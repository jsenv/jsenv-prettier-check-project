import { metaMapToSpecifierMetaMap } from "@jsenv/url-meta"
import { collectFiles } from "@jsenv/file-collector"
import {
  catchAsyncFunctionCancellation,
  createCancellationTokenForProcessSIGINT,
} from "@jsenv/cancellation"
import { hasScheme, filePathToUrl, urlToFilePath } from "./internal/urlUtils.js"
import {
  STATUS_NOT_SUPPORTED,
  STATUS_ERRORED,
  STATUS_IGNORED,
  STATUS_UGLY,
  STATUS_PRETTY,
} from "./internal/STATUS.js"
import { prettierCheckFile } from "./internal/prettierCheckFile.js"
import {
  createErroredFileLog,
  createIgnoredFileLog,
  createUglyFileLog,
  createPrettyFileLog,
  createSummaryLog,
} from "./internal/log.js"
import { jsenvProjectFilesConfig } from "./jsenvProjectFilesConfig.js"

export const prettierCheckProject = async ({
  cancellationToken = createCancellationTokenForProcessSIGINT(),
  projectDirectoryUrl,
  jsenvDirectoryRelativeUrl = ".jsenv",
  prettierIgnoreFileRelativeUrl = ".prettierignore",
  projectFilesConfig = jsenvProjectFilesConfig,
  logErrored = true,
  logIgnored = false,
  logUgly = true,
  logPretty = false,
  logSummary = true,
  updateProcessExitCode = true,
}) => {
  projectDirectoryUrl = normalizeProjectDirectoryUrl(projectDirectoryUrl)
  if (typeof projectFilesConfig !== "object") {
    throw new TypeError(`projectFilesConfig must be an object, got ${projectFilesConfig}`)
  }

  return catchAsyncFunctionCancellation(async () => {
    const specifierMetaMap = metaMapToSpecifierMetaMap({
      prettify: {
        ...projectFilesConfig,
        ...(jsenvDirectoryRelativeUrl
          ? { [ensureTrailingSlash(jsenvDirectoryRelativeUrl)]: false }
          : {}),
      },
    })

    const report = {}
    await collectFiles({
      cancellationToken,
      directoryUrl: projectDirectoryUrl,
      specifierMetaMap,
      predicate: (meta) => meta.prettify === true,
      matchingFileOperation: async ({ relativeUrl }) => {
        const { status, statusDetail } = await prettierCheckFile({
          projectDirectoryUrl,
          fileRelativeUrl: relativeUrl,
          prettierIgnoreFileRelativeUrl,
        })

        if (status === STATUS_NOT_SUPPORTED) {
          return
        }

        report[relativeUrl] = { status, statusDetail }

        if (status === STATUS_ERRORED) {
          if (logErrored) {
            console.log(createErroredFileLog({ relativeUrl, statusDetail }))
          }
          return
        }

        if (status === STATUS_IGNORED) {
          if (logIgnored) {
            console.log(createIgnoredFileLog({ relativeUrl }))
          }
          return
        }

        if (status === STATUS_UGLY) {
          if (logUgly) {
            console.log(createUglyFileLog({ relativeUrl }))
          }
          return
        }

        if (logPretty) {
          console.log(createPrettyFileLog({ relativeUrl }))
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
}

const normalizeProjectDirectoryUrl = (value) => {
  if (value instanceof URL) {
    value = value.href
  }

  if (typeof value === "string") {
    const url = hasScheme(value) ? value : filePathToUrl(value)

    if (!url.startsWith("file://")) {
      throw new Error(`projectDirectoryUrl must starts with file://, received ${value}`)
    }

    return ensureTrailingSlash(url)
  }

  throw new TypeError(`projectDirectoryUrl must be a string or an url, received ${value}`)
}

const ensureTrailingSlash = (string) => {
  return string.endsWith("/") ? string : `${string}/`
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
