const close = "\x1b[0m"
const green = "\x1b[32m"
const red = "\x1b[31m"
const blue = "\x1b[34m"
const yellow = "\x1b[33m"
const magenta = "\x1b[35m"
// const grey = "\x1b[39m"

export const erroredStyle = (string) => `${red}${string}${close}`
export const erroredStyleWithIcon = (string) => erroredStyle(`${erroredIcon} ${string}`)
const erroredIcon = "\u2613" // cross ☓

export const notSupportedStyle = (string) => `${magenta}${string}${close}`
export const notSupportedStyleWithIcon = (string) =>
  notSupportedStyle(`${notSupportedIcon} ${string}`)
const notSupportedIcon = "\u2714" // checkmark ✔

export const ignoredStyle = (string) => `${magenta}${string}${close}`
export const ignoredStyleWithIcon = (string) => ignoredStyle(`${ignoredIcon} ${string}`)
const ignoredIcon = "\u2714" // checkmark ✔
// const ignoredIcon = "\u003F" // question mark ?

export const uglyStyle = (string) => `${yellow}${string}${close}`
export const uglyStyleWithIcon = (string) => uglyStyle(`${uglyIcon} ${string}`)
const uglyIcon = "\u2613" // cross ☓

export const prettyStyle = (string) => `${green}${string}${close}`
export const prettyStyleWithIcon = (string) => prettyStyle(`${prettyIcon} ${string}`)
const prettyIcon = "\u2714" // checkmark ✔

export const formattedStyle = (string) => `${blue}${string}${close}`
export const formattedStyleWithIcon = (string) => formattedStyle(`${formattedIcon} ${string}`)
const formattedIcon = "\u2714" // checkmark ✔
