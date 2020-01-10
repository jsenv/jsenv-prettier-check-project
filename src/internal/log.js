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
  if (totalCount === 0) return `done.`

  return `${createSummaryDetails({
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
    return `all ${uglyStyle("needs formatting")}`
  }
  if (prettyCount === totalCount) {
    return `all ${prettyStyle("already formatted")}`
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
    parts.push(`${uglyCount} ${uglyStyle("needs formatting")}`)
  }

  if (prettyCount) {
    parts.push(`${prettyCount} ${prettyStyle("already formatted")}`)
  }

  return `${parts.join(", ")}.`
}

export const createErroredFileLog = ({
  relativeUrl,
  statusDetail,
}) => `${relativeUrl} -> ${erroredStyleWithIcon("errored")}
${statusDetail}`

export const createIgnoredFileLog = ({ relativeUrl }) =>
  `${relativeUrl} -> ${ignoredStyleWithIcon("ignored")}`

export const createUglyFileLog = ({ relativeUrl }) =>
  `${relativeUrl} -> ${uglyStyleWithIcon("needs formatting")}`

export const createPrettyFileLog = ({ relativeUrl }) =>
  `${relativeUrl} -> ${prettyStyleWithIcon("already formatted")}`
