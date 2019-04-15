import { DEFAULT_PRETTIFY_META_MAP } from "./src/prettier-check-project-constant.js"

export { prettierCheckProject } from "./src/prettierCheckProject.js"

export const extendDefaultPrettifyMetaMap = (prettifyMetaMap) => {
  return { ...DEFAULT_PRETTIFY_META_MAP, ...prettifyMetaMap }
}
