# jsenv-prettier-check-project

[![npm package](https://img.shields.io/npm/v/@jsenv/prettier-check-project.svg)](https://www.npmjs.com/package/@jsenv/prettier-check-project)
[![build](https://travis-ci.com/jsenv/jsenv-prettier-check-project.svg?branch=master)](http://travis-ci.com/jsenv/jsenv-prettier-check-project)
[![codecov](https://codecov.io/gh/jsenv/jsenv-prettier-check-project/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-prettier-check-project)

> Run this during continuous integration to ensure your files respects your prettier configuration.

## Introduction

You can use this to ensure your source files are respects prettier format.<br />

## How to use

Create a file like this:

```js
const { prettierCheckProject, jsenvPrettifyMap } = require("@jsenv/prettier-check-project")

prettierCheckProject({
  projectPath: "/Users/you/folder",
  prettifyMap: {
    ...jsenvPrettifyMap,
    "/.cache/": false,
  },
})
```

And add it to your continuous integration script.<br />

By default the script will set process.exitCode to 1 if one or more file are not formatted using prettier.<br />
You can control this by passing `updateProcessExitCode`.

```js
const { prettierCheckProject } = require("@jsenv/prettier-check-project")

prettierCheckProject({
  projectPath: "/Users/you/folder",
  prettifyMap: {
    ...jsenvPrettifyMap,
    "/.cache/": false,
  },
  updateProcessExitCode: false,
})
```

## Installation

```console
npm install @jsenv/prettier-check-project@2.9.0
```
