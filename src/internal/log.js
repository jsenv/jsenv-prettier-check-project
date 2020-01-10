import {
  erroredStyle,
  erroredStyleWithIcon,
  notSupportedStyleWithIcon,
  ignoredStyle,
  ignoredStyleWithIcon,
  uglyStyle,
  uglyStyleWithIcon,
  prettyStyle,
  prettyStyleWithIcon,
  formattedStyle,
  formattedStyleWithIcon,
} from "./style.js"

export const createSummaryLog = ({ totalCount, ...rest }) => {
  if (totalCount === 0)
    return `
done.`

  return `
${createSummaryDetails({
  totalCount,
  ...rest,
})}`
}

const createSummaryDetails = ({
  totalCount,
  ignoredCount,
  notSupportedCount,
  erroredCount,
  uglyCount,
  formattedCount,
  prettyCount,
}) => {
  if (prettyCount === totalCount) {
    return `all ${prettyStyle("already formatted")}`
  }
  if (formattedCount === totalCount) {
    return `all ${formattedCount("formatted")}`
  }
  if (erroredCount === totalCount) {
    return `all ${erroredStyle("errored")}`
  }
  if (ignoredCount + notSupportedCount === totalCount) {
    return `all ${ignoredStyle("ignored or not supported")}`
  }
  if (uglyCount === totalCount) {
    return `all ${uglyStyle("needs formatting")}`
  }

  return createMixedDetails({
    ignoredCount,
    notSupportedCount,
    erroredCount,
    uglyCount,
    formattedCount,
    prettyCount,
  })
}

const createMixedDetails = ({
  ignoredCount,
  notSupportedCount,
  erroredCount,
  uglyCount,
  formattedCount,
  prettyCount,
}) => {
  const parts = []

  if (erroredCount) {
    parts.push(`${erroredCount} ${erroredStyle("errored")}`)
  }

  if (formattedCount) {
    parts.push(`${formattedCount} ${formattedStyle("formatted")}`)
  }

  if (prettyCount) {
    parts.push(`${prettyCount} ${prettyStyle("already formatted")}`)
  }

  if (ignoredCount || notSupportedCount) {
    parts.push(`${ignoredCount + notSupportedCount} ${ignoredStyle("ignored or not supported")}`)
  }

  if (uglyCount) {
    parts.push(`${uglyCount} ${uglyStyle("needs formatting")}`)
  }

  return `${parts.join(", ")}.`
}

export const createIgnoredFileLog = ({ relativeUrl }) => `
${relativeUrl} -> ${ignoredStyleWithIcon("ignored")}`

export const createNotSupportedFileLog = ({ relativeUrl }) => `
${relativeUrl} -> ${notSupportedStyleWithIcon("not supported")}`

export const createErroredFileLog = ({ relativeUrl, statusDetail }) => `
${relativeUrl} -> ${erroredStyleWithIcon("errored")}
${statusDetail}`

export const createUglyFileLog = ({ relativeUrl }) => `
${relativeUrl} -> ${uglyStyleWithIcon("needs formatting")}`

export const createFormattedFileLog = ({ relativeUrl }) => `
${relativeUrl} -> ${formattedStyleWithIcon("formatted")}`

export const createPrettyFileLog = ({ relativeUrl }) => `
${relativeUrl} -> ${prettyStyleWithIcon("already formatted")}`
