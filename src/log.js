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
}) => `${totalCount} files checked:
- ${erroredStyle(`${erroredCount} errored`)}
- ${ignoredStyle(`${ignoredCount} ignored`)}
- ${uglyStyle(`${uglyCount} ugly`)}
- ${prettyStyle(`${prettyCount} pretty`)}`

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
