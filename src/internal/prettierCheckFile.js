import { readFile } from "fs"
import {
  STATUS_NOT_SUPPORTED,
  STATUS_IGNORED,
  STATUS_PRETTY,
  STATUS_UGLY,
  STATUS_ERRORED,
} from "./STATUS.js"
import { resolveUrl, urlToFilePath } from "./urlUtils.js"

const { resolveConfig, getFileInfo, check } = import.meta.require("prettier")

export const prettierCheckFile = async ({
  projectDirectoryUrl,
  fileRelativeUrl,
  prettierIgnoreFileRelativeUrl,
}) => {
  const fileUrl = resolveUrl(fileRelativeUrl, projectDirectoryUrl)
  const filePath = urlToFilePath(fileUrl)
  const prettierIgnoreFileUrl = resolveUrl(prettierIgnoreFileRelativeUrl, projectDirectoryUrl)
  const prettierIgnoreFilePath = urlToFilePath(prettierIgnoreFileUrl)

  try {
    const [source, options, info] = await Promise.all([
      getFileContentAsString(filePath),
      resolveConfig(filePath),
      getFileInfo(filePath, {
        ignorePath: prettierIgnoreFilePath,
        withNodeModules: false,
      }),
    ])

    const { ignored, inferredParser } = info

    if (inferredParser === null) {
      return {
        status: STATUS_NOT_SUPPORTED,
      }
    }

    if (ignored) {
      return {
        status: STATUS_IGNORED,
      }
    }
    const pretty = check(source, { ...options, filepath: filePath })
    return {
      status: pretty ? STATUS_PRETTY : STATUS_UGLY,
    }
  } catch (e) {
    return {
      status: STATUS_ERRORED,
      statusDetail: e,
    }
  }
}

const getFileContentAsString = (filename) =>
  new Promise((resolve, reject) => {
    readFile(filename, (error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer.toString())
      }
    })
  })
