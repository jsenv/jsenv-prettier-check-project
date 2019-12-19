# Prettier check project

[![github package](https://img.shields.io/github/package-json/v/jsenv/jsenv-prettier-check-project.svg?label=package&logo=github)](https://github.com/jsenv/jsenv-prettier-check-project/packages)
[![npm package](https://img.shields.io/npm/v/@jsenv/prettier-check-project.svg?logo=npm&label=package)](https://www.npmjs.com/package/@jsenv/prettier-check-project)
[![ci status](https://github.com/jsenv/jsenv-prettier-check-project/workflows/ci/badge.svg)](https://github.com/jsenv/jsenv-prettier-check-project/actions)
[![codecov](https://codecov.io/gh/jsenv/jsenv-prettier-check-project/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-prettier-check-project)

Ensure your files where formatted with prettier.

## Introduction

This package was designed to run in a continuous workflow to verify that your files where formatted with prettier. Any file prettier can format that is not formatted with it is considered as a problem and fails your build.

## How to use

Create a file like this:

```js
const { prettierCheckProject } = require("@jsenv/prettier-check-project")

prettierCheckProject({
  projectDirectoryUrl: "file:///Users/you/directory",
})
```

And run it during your continuous workflow.

By default the script will set process.exitCode to 1 if one or more file are not formatted using prettier.<br />
You can control this by passing `updateProcessExitCode`.

```js
const { prettierCheckProject } = require("@jsenv/prettier-check-project")

prettierCheckProject({
  projectDirectoryUrl: "file:///Users/you/folder/",
  updateProcessExitCode: false,
})
```

## Installation

```console
npm install @jsenv/prettier-check-project@4.2.0
```
