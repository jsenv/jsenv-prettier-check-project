import { readFile } from "fs"
import { pathnameToFilename } from "@dmail/helper"
import { STATUS_IGNORED, STATUS_PRETTY, STATUS_UGLY, STATUS_ERRORED } from "./STATUS.js"

const { resolveConfig, getFileInfo, check } = import.meta.require("prettier")

export const prettierCheckFile = async ({ projectPathname, fileRelativePath }) => {
  const filename = pathnameToFilename(`${projectPathname}${fileRelativePath}`)

  try {
    const [source, options, info] = await Promise.all([
      getFileContentAsString(filename),
      resolveConfig(filename),
      getFileInfo(filename),
    ])

    const { ignored } = info
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
