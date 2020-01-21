/* eslint-disable import/max-dependencies */
import { createRequire } from "module"
import {
  metaMapToSpecifierMetaMap,
  resolveUrl,
  assertAndNormalizeDirectoryUrl,
  urlToFileSystemPath,
  writeFile,
} from "@jsenv/util"
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
  createNotSupportedFileLog,
} from "./internal/log.js"
import { collectStagedFiles } from "./internal/collectStagedFiles.js"
import { collectProjectFiles } from "./internal/collectProjectFiles.js"
import { jsenvProjectFilesConfig } from "./jsenvProjectFilesConfig.js"

import { generatePrettierReportForFile } from "./internal/generatePrettierReportForFile.js"

const require = createRequire(import.meta.url)
const { format } = require("prettier")

export const formatWithPrettier = async ({
  logLevel,
  cancellationToken = createCancellationTokenForProcessSIGINT(),
  projectDirectoryUrl,
  jsenvDirectoryRelativeUrl = ".jsenv",
  prettierIgnoreFileRelativeUrl = ".prettierignore",
  projectFilesConfig = jsenvProjectFilesConfig,
  staged = process.argv.includes("--staged"),
  dryRun = process.argv.includes("--dry-run"),
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
      const stagedFiles = await collectStagedFiles({
        cancellationToken,
        projectDirectoryUrl,
        specifierMetaMap,
        predicate: (meta) => meta.prettify === true,
      })
      files = stagedFiles
    } else {
      const projectFiles = await collectProjectFiles({
        cancellationToken,
        projectDirectoryUrl,
        specifierMetaMap,
        predicate: (meta) => meta.prettify === true,
      })
      files = projectFiles
    }

    const fileOrigin = staged ? "staged" : "project"

    if (files.length === 0) {
      logger.info(`no ${fileOrigin} file to ${dryRun ? "check (dryRun enabled)" : "check"}`)
    } else {
      logger.info(
        `${files.length} ${fileOrigin} file${files.length === 1 ? "" : "s"} to ${
          dryRun ? "check (dryRun enabled)" : "check"
        }`,
      )
    }

    const report = {}
    await Promise.all(
      files.map(async (relativeUrl) => {
        const fileReport = {}
        report[relativeUrl] = fileReport

        const fileUrl = resolveUrl(relativeUrl, projectDirectoryUrl)
        const prettierReport = await generatePrettierReportForFile(fileUrl, {
          prettierIgnoreFileUrl,
        })
        const { status, statusDetail, options, source } = prettierReport

        fileReport.status = status
        fileReport.statusDetail = statusDetail

        if (status === STATUS_UGLY && !dryRun) {
          const sourceFormatted = await format(source, {
            ...options,
            filepath: urlToFileSystemPath(fileUrl),
          })
          await writeFile(fileUrl, sourceFormatted)
          fileReport.status = STATUS_FORMATTED
        }
      }),
    )

    Object.keys(report).forEach((relativeUrl) => {
      const { status, statusDetail } = report[relativeUrl]

      if (status === STATUS_NOT_SUPPORTED) {
        logger.debug(createNotSupportedFileLog({ relativeUrl }))
      } else if (status === STATUS_ERRORED) {
        logger.error(createErroredFileLog({ relativeUrl, statusDetail }))
      } else if (status === STATUS_IGNORED) {
        logger.debug(createIgnoredFileLog({ relativeUrl }))
      } else if (status === STATUS_UGLY) {
        logger.warn(createUglyFileLog({ relativeUrl }))
      } else if (status === STATUS_FORMATTED) {
        logger.info(createFormattedFileLog({ relativeUrl }))
      } else if (status === STATUS_PRETTY) {
        logger.debug(createPrettyFileLog({ relativeUrl }))
      }
    })

    const summary = summarizeReport(report)
    if (files.length && logSummary) {
      logger.info(`${createSummaryLog(summary)}`)
    }

    if (dryRun && updateProcessExitCode) {
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
  const notSupportedArray = fileArray.filter((file) => report[file].status === STATUS_NOT_SUPPORTED)
  const ignoredArray = fileArray.filter((file) => report[file].status === STATUS_IGNORED)
  const uglyArray = fileArray.filter((file) => report[file].status === STATUS_UGLY)
  const formattedArray = fileArray.filter((file) => report[file].status === STATUS_FORMATTED)
  const prettyArray = fileArray.filter((file) => report[file].status === STATUS_PRETTY)

  return {
    totalCount: fileArray.length,
    ignoredCount: ignoredArray.length,
    notSupportedCount: notSupportedArray.length,
    erroredCount: erroredArray.length,
    uglyCount: uglyArray.length,
    formattedCount: formattedArray.length,
    prettyCount: prettyArray.length,
  }
}

const ensureUrlTrailingSlash = (url) => {
  return url.endsWith("/") ? url : `${url}/`
}
