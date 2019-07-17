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
  if (totalCount === 0) return `0 file checked.`

  return `${totalCount} file checked: ${createSummaryDetails({
    totalCount,
    erroredCount,
    ignoredCount,
    uglyCount,
    prettyCount,
  })}`
}

const createSummaryDetails = ({
  totalCount,
  erroredCount,
  ignoredCount,
  uglyCount,
  prettyCount,
}) => {
  if (erroredCount === totalCount) {
    return `all ${erroredStyle("errored")}`
  }
  if (ignoredCount === totalCount) {
    return `all ${ignoredStyle("ignored")}`
  }
  if (uglyCount === totalCount) {
    return `all ${uglyStyle("ugly")}`
  }
  if (prettyCount === totalCount) {
    return `all ${prettyStyle("pretty")}`
  }

  return createMixedDetails({
    erroredCount,
    ignoredCount,
    uglyCount,
    prettyCount,
  })
}

const createMixedDetails = ({ erroredCount, ignoredCount, uglyCount, prettyCount }) => {
  const parts = []

  if (erroredCount) {
    parts.push(`${erroredCount} ${erroredStyle("errored")}`)
  }

  if (ignoredCount) {
    parts.push(`${ignoredCount} ${ignoredStyle("ignored")}`)
  }

  if (uglyCount) {
    parts.push(`${uglyCount} ${uglyStyle("ugly")}`)
  }

  if (prettyCount) {
    parts.push(`${prettyCount} ${prettyStyle("pretty")}`)
  }

  return `${parts.join(", ")}.`
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
