import { collectFiles } from "@jsenv/file-collector"

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
