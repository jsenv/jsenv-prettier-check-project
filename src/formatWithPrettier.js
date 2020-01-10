import { metaMapToSpecifierMetaMap } from "@jsenv/url-meta"
import { collectFiles } from "@jsenv/file-collector"
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
} from "./internal/STATUS.js"
import {
  createErroredFileLog,
  createIgnoredFileLog,
  createUglyFileLog,
  createPrettyFileLog,
  createSummaryLog,
} from "./internal/log.js"
import { collectStagedFiles } from "./internal/collectStagedFiles.js"
import { jsenvProjectFilesConfig } from "./jsenvProjectFilesConfig.js"
import { resolveUrl, assertAndNormalizeDirectoryUrl } from "@jsenv/util"
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
  logUgly = false,
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
      files = await collectFiles({
        cancellationToken,
        directoryUrl: projectDirectoryUrl,
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
      files.map(async ({ relativeUrl }) => {
        const fileUrl = resolveUrl(relativeUrl, projectDirectoryUrl)
        const { status, statusDetail } = await generatePrettierReportForFile(fileUrl, {
          prettierIgnoreFileUrl,
        })

        if (status === STATUS_NOT_SUPPORTED) {
          return
        }

        report[relativeUrl] = { status, statusDetail }

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
          if (logUgly) {
            logger.info(createUglyFileLog({ relativeUrl }))
          }
          return
        }

        if (logPretty) {
          logger.debug(createPrettyFileLog({ relativeUrl }))
        }
      }),
    )

    const summary = summarizeReport(report)
    if (logSummary) {
      logger.info(createSummaryLog(summary))
    }

    if (!check) {
      const filesToFormat = Object.keys(report).filter(
        (file) => report[file].status === STATUS_UGLY,
      )
      if (filesToFormat.length) {
        logger.info(`formatting ${filesToFormat.length} files`)
        await Promise.all(
          filesToFormat.map(async (fileRelativeUrl) => {
            logger.info(`format ${fileRelativeUrl}`)
            const fileUrl = resolveUrl(fileRelativeUrl, projectDirectoryUrl)
            const options = report[fileRelativeUrl].options
            await format(fileUrl, options)
          }),
        )
        logger.info("formatting done.")
      }
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
  const prettyArray = fileArray.filter((file) => report[file].status === STATUS_PRETTY)

  return {
    totalCount: fileArray.length,
    erroredCount: erroredArray.length,
    ignoredCount: ignoredArray.length,
    uglyCount: uglyArray.length,
    prettyCount: prettyArray.length,
  }
}

const ensureUrlTrailingSlash = (url) => {
  return url.endsWith("/") ? url : `${url}/`
}
