import { readFile } from "fs"
import { STATUS_IGNORED, STATUS_PRETTY, STATUS_UGLY, STATUS_ERRORED } from "./STATUS.js"

const { resolveConfig, getFileInfo, check } = import.meta.require("prettier")

export const checkFileFormat = async ({ projectFolder, filenameRelative }) => {
  const filename = `${projectFolder}/${filenameRelative}`

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

const getFileContentAsString = (pathname) =>
  new Promise((resolve, reject) => {
    readFile(pathname, (error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer.toString())
      }
    })
  })
