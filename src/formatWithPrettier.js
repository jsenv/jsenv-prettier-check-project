import { metaMapToSpecifierMetaMap } from "@jsenv/url-meta"
import {
  catchAsyncFunctionCancellation,
  createCancellationTokenForProcessSIGINT,
} from "@jsenv/cancellation"
import { createLogger } from "@jsenv/logger"
import {
  STATUS_NOT_SUPPORTED,
  STATUS_ERRORED,
  STATUS_IGNORED,
  STATUS_UGLY,
  STATUS_PRETTY,
  STATUS_FORMATTED,
} from "./internal/STATUS.js"
import {
  createErroredFileLog,
  createIgnoredFileLog,
  createUglyFileLog,
  createPrettyFileLog,
  createSummaryLog,
  createFormattedFileLog,
} from "./internal/log.js"
import { collectStagedFiles } from "./internal/collectStagedFiles.js"
import { collectProjectFiles } from "./internal/collectProjectFiles.js"
import { jsenvProjectFilesConfig } from "./jsenvProjectFilesConfig.js"
import {
  resolveUrl,
  assertAndNormalizeDirectoryUrl,
  urlToFileSystemPath,
  writeFile,
} from "@jsenv/util"
import { generatePrettierReportForFile } from "./internal/generatePrettierReportForFile.js"

const { format } = import.meta.require("prettier")

export const formatWithPrettier = async ({
  logLevel,
  cancellationToken = createCancellationTokenForProcessSIGINT(),
  projectDirectoryUrl,
  jsenvDirectoryRelativeUrl = ".jsenv",
  prettierIgnoreFileRelativeUrl = ".prettierignore",
  projectFilesConfig = jsenvProjectFilesConfig,
  staged = process.execArgv.includes("--staged"),
  check = process.execArgv.includes("--check"),
  logErrored = true,
  logIgnored = false,
  logUgly = true,
  logFormatted = true,
  logPretty = false,
  logSummary = true,
  updateProcessExitCode = false,
}) => {
  const logger = createLogger({ logLevel })

  projectDirectoryUrl = assertAndNormalizeDirectoryUrl(projectDirectoryUrl)
  if (typeof projectFilesConfig !== "object") {
    throw new TypeError(`projectFilesConfig must be an object, got ${projectFilesConfig}`)
  }

  const prettierIgnoreFileUrl = resolveUrl(prettierIgnoreFileRelativeUrl, projectDirectoryUrl)

  return catchAsyncFunctionCancellation(async () => {
    const specifierMetaMap = metaMapToSpecifierMetaMap({
      prettify: {
        ...projectFilesConfig,
        ...(jsenvDirectoryRelativeUrl
          ? { [ensureUrlTrailingSlash(jsenvDirectoryRelativeUrl)]: false }
          : {}),
      },
    })

    let files
    if (staged) {
      files = await collectStagedFiles({
        cancellationToken,
        projectDirectoryUrl,
        specifierMetaMap,
        predicate: (meta) => meta.prettify === true,
      })
    } else {
      files = await collectProjectFiles({
        cancellationToken,
        projectDirectoryUrl,
        specifierMetaMap,
        predicate: (meta) => meta.prettify === true,
      })
    }

    if (files.length === 0) {
      logger.info(`no file format to check.`)
    } else {
      logger.info(`checking ${files.length} files format.`)
    }

    const report = {}
    await Promise.all(
      files.map(async (relativeUrl) => {
        const fileUrl = resolveUrl(relativeUrl, projectDirectoryUrl)
        const prettierReport = await generatePrettierReportForFile(fileUrl, {
          prettierIgnoreFileUrl,
        })
        const { status, statusDetail, options, source } = prettierReport

        if (status === STATUS_NOT_SUPPORTED) {
          return
        }

        report[relativeUrl] = prettierReport

        if (status === STATUS_ERRORED) {
          if (logErrored) {
            logger.error(createErroredFileLog({ relativeUrl, statusDetail }))
          }
          return
        }

        if (status === STATUS_IGNORED) {
          if (logIgnored) {
            logger.debug(createIgnoredFileLog({ relativeUrl }))
          }
          return
        }

        if (status === STATUS_UGLY) {
          if (check) {
            if (logUgly) {
              logger.info(createUglyFileLog({ relativeUrl }))
            }
            return
          }

          const sourceFormatted = await format(source, {
            ...options,
            filepath: urlToFileSystemPath(fileUrl),
          })
          await writeFile(fileUrl, sourceFormatted)
          prettierReport.status = STATUS_FORMATTED
          if (logFormatted) {
            logger.info(createFormattedFileLog({ relativeUrl }))
          }
          return
        }

        if (logPretty) {
          logger.debug(createPrettyFileLog({ relativeUrl }))
        }
      }),
    )

    const summary = summarizeReport(report)
    if (files.length && logSummary) {
      logger.info(`${createSummaryLog(summary)}`)
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

const summarizeReport = (report) => {
  const fileArray = Object.keys(report)

  const erroredArray = fileArray.filter((file) => report[file].status === STATUS_ERRORED)
  const ignoredArray = fileArray.filter((file) => report[file].status === STATUS_IGNORED)
  const uglyArray = fileArray.filter((file) => report[file].status === STATUS_UGLY)
  const formattedArray = fileArray.filter((file) => report[file].status === STATUS_FORMATTED)
  const prettyArray = fileArray.filter((file) => report[file].status === STATUS_PRETTY)

  return {
    totalCount: fileArray.length,
    erroredCount: erroredArray.length,
    ignoredCount: ignoredArray.length,
    uglyCount: uglyArray.length,
    formattedCount: formattedArray.length,
    prettyCount: prettyArray.length,
  }
}

const ensureUrlTrailingSlash = (url) => {
  return url.endsWith("/") ? url : `${url}/`
}
