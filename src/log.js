import {
  erroredStyle,
  erroredStyleWithIcon,
  ignoredStyle,
  ignoredStyleWithIcon,
  uglyStyle,
  uglyStyleWithIcon,
  prettyStyle,
  prettyStyleWithIcon,
} from "./style.js"

export const createSummaryLog = ({
  totalCount,
  erroredCount,
  ignoredCount,
  uglyCount,
  prettyCount,
}) => {
  const lines = []

  if (erroredCount > 0) lines.push(`- ${erroredStyle(`${erroredCount} errored`)}`)
  if (ignoredCount > 0) lines.push(`- ${ignoredStyle(`${ignoredCount} ignored`)}`)
  if (uglyCount > 0) lines.push(`- ${uglyStyle(`${uglyCount} ugly`)}`)
  if (prettyCount > 0) lines.push(`- ${prettyStyle(`${prettyCount} pretty`)}`)

  return `${totalCount} files checked:
${lines.join(`
`)}`
}

export const createErroredFileLog = ({ relativePath, statusDetail }) => `${relativePath.slice(
  1,
)} -> ${erroredStyleWithIcon("errored")}
${statusDetail}`

export const createIgnoredFileLog = ({ relativePath }) =>
  `${relativePath.slice(1)} -> ${ignoredStyleWithIcon("ignored")}`

export const createUglyFileLog = ({ relativePath }) =>
  `${relativePath.slice(1)} -> ${uglyStyleWithIcon("ugly")}`

export const createPrettyFileLog = ({ relativePath }) =>
  `${relativePath.slice(1)} -> ${prettyStyleWithIcon("pretty")}`
