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

export const createErroredFileLog = ({
  filenameRelative,
  statusDetail,
}) => `${filenameRelative} -> ${erroredStyleWithIcon("errored")}
${statusDetail}`

export const createIgnoredFileLog = ({ filenameRelative }) =>
  `${filenameRelative} -> ${ignoredStyleWithIcon("ignored")}`

export const createUglyFileLog = ({ filenameRelative }) =>
  `${filenameRelative} -> ${uglyStyleWithIcon("ugly")}`

export const createPrettyFileLog = ({ filenameRelative }) =>
  `${filenameRelative} -> ${prettyStyleWithIcon("pretty")}`
