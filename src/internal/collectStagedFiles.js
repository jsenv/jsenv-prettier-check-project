import { exec } from "child_process"
import { resolveUrl } from "@jsenv/util"
import { urlToMeta } from "@jsenv/url-meta"

export const collectStagedFiles = async ({ projectDirectoryUrl, specifierMetaMap, predicate }) => {
  // https://git-scm.com/docs/git-diff
  const gitDiffOutput = await runCommand("git diff --staged --name-only --diff-filter=AM")
  const files = gitDiffOutput.split(/\n/g)
  return files.filter((relativePath) => {
    return predicate(
      urlToMeta({
        url: resolveUrl(relativePath, projectDirectoryUrl),
        specifierMetaMap,
      }),
    )
  })
}

const runCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        // sometimes (e.g. eslint) we have a meaningful stdout along with the stderr
        reject(stdout ? `${stdout}\n\n${stderr}` : stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}
