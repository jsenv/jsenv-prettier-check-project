import { readFile } from "fs"
import { pathnameToOperatingSystemPath } from "@jsenv/operating-system-path"
import {
  STATUS_NOT_SUPPORTED,
  STATUS_IGNORED,
  STATUS_PRETTY,
  STATUS_UGLY,
  STATUS_ERRORED,
} from "./STATUS.js"

const { resolveConfig, getFileInfo, check } = import.meta.require("prettier")

export const prettierCheckFile = async ({
  projectPathname,
  fileRelativePath,
  prettierIgnoreRelativePath,
}) => {
  const filename = pathnameToOperatingSystemPath(`${projectPathname}${fileRelativePath}`)

  try {
    const [source, options, info] = await Promise.all([
      getFileContentAsString(filename),
      resolveConfig(filename),
      getFileInfo(filename, {
        ignorePath: pathnameToOperatingSystemPath(
          `${projectPathname}${prettierIgnoreRelativePath}`,
        ),
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
    const pretty = check(source, { ...options, filepath: filename })
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
