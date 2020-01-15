import { collectFiles } from "@jsenv/util"

export const collectProjectFiles = async ({
  cancellationToken,
  projectDirectoryUrl,
  specifierMetaMap,
  predicate,
}) => {
  const files = await collectFiles({
    cancellationToken,
    directoryUrl: projectDirectoryUrl,
    specifierMetaMap,
    predicate,
  })
  return files.map(({ relativeUrl }) => relativeUrl)
}
