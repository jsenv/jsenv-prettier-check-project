import {
  STATUS_NOT_SUPPORTED,
  STATUS_IGNORED,
  STATUS_PRETTY,
  STATUS_UGLY,
  STATUS_ERRORED,
} from "./STATUS.js"
import { urlToFileSystemPath, readFile } from "@jsenv/util"

const { resolveConfig, getFileInfo, check } = import.meta.require("prettier")

export const generatePrettierReportForFile = async (fileUrl, { prettierIgnoreFileUrl } = {}) => {
  const filePath = urlToFileSystemPath(fileUrl)

  try {
    const [source, options, info] = await Promise.all([
      readFile(filePath),
      resolveConfig(filePath),
      getFileInfo(filePath, {
        ...(prettierIgnoreFileUrl
          ? {
              ignorePath: urlToFileSystemPath(prettierIgnoreFileUrl),
            }
          : {}),
        withNodeModules: false,
      }),
    ])

    const { ignored, inferredParser } = info

    if (inferredParser === null) {
      return {
        status: STATUS_NOT_SUPPORTED,
        options,
      }
    }

    if (ignored) {
      return {
        status: STATUS_IGNORED,
        options,
      }
    }

    const pretty = check(source, { ...options, filepath: filePath })
    if (pretty) {
      return {
        status: STATUS_PRETTY,
        options,
      }
    }

    return {
      status: STATUS_UGLY,
      options,
    }
  } catch (e) {
    return {
      status: STATUS_ERRORED,
      statusDetail: e,
    }
  }
}
