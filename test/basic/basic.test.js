import { assert } from "@jsenv/assert"
import { ensureEmptyDirectory, resolveUrl, writeFile, readFile } from "@jsenv/util"
import { formatWithPrettier } from "../../index.js"

const tempDirectoryUrl = import.meta.resolve("./temp/")
await ensureEmptyDirectory(tempDirectoryUrl)

{
  const uglyJsonFileUrl = resolveUrl("ugly.json", tempDirectoryUrl)
  const uglyMarkdownFileUrl = resolveUrl("ugly.md", tempDirectoryUrl)
  const textFileUrl = resolveUrl("file.txt", tempDirectoryUrl)
  const uglyCssFileUrl = resolveUrl("ugly.css", tempDirectoryUrl)
  const uglyYamlFileUrl = resolveUrl("ugly.yml", tempDirectoryUrl)
  const uglyHtmlFileUrl = resolveUrl("ugly.html", tempDirectoryUrl)
  const uglyJsxFileUrl = resolveUrl("ugly.jsx", tempDirectoryUrl)
  const uglyJavaScriptFileUrl = resolveUrl("ugly.js", tempDirectoryUrl)
  const prettyJavaScriptFileUrl = resolveUrl("pretty.js", tempDirectoryUrl)
  const erroredJavaScriptFileUrl = resolveUrl("error.js", tempDirectoryUrl)
  const uglyAndExcludedJavaScriptFileUrl = resolveUrl("node_modules/ugly.js", tempDirectoryUrl)
  const uglyAndIgnoredFileUrl = resolveUrl("ignored.js", tempDirectoryUrl)
  const prettierIgnoreFileUrl = resolveUrl(".prettierignore", tempDirectoryUrl)
  const notSupportedFileUrl = resolveUrl("file", tempDirectoryUrl)
  await writeFile(uglyJsonFileUrl, `{  }`)
  await writeFile(uglyMarkdownFileUrl, `## Title`)
  await writeFile(uglyJavaScriptFileUrl, `export const a = true;`)
  await writeFile(textFileUrl, `hello world`)
  await writeFile(uglyCssFileUrl, `body { background-color: red; }`)
  await writeFile(uglyYamlFileUrl, `foo: 1`)
  await writeFile(uglyHtmlFileUrl, `<div></div>`)
  await writeFile(uglyJsxFileUrl, `const el = <Foo attr={10}></Foo>;`)
  await writeFile(
    prettyJavaScriptFileUrl,
    `export const a = true
`,
  )
  await writeFile(erroredJavaScriptFileUrl, `export const a = (`)
  await writeFile(uglyAndExcludedJavaScriptFileUrl, `export const a = true;`)
  await writeFile(prettierIgnoreFileUrl, "ignored.js")
  await writeFile(uglyAndIgnoredFileUrl, "export const a = true;")
  await writeFile(notSupportedFileUrl, "hello")

  const actual = await formatWithPrettier({
    logLevel: "debug",
    projectDirectoryUrl: tempDirectoryUrl,
    prettierIgnoreFileRelativeUrl: "./.prettierignore",
    // staged: true
  })
  const expected = {
    report: actual.report,
    summary: {
      totalCount: 13,
      ignoredCount: 1,
      notSupportedCount: 3,
      erroredCount: 1,
      uglyCount: 0,
      formattedCount: 7,
      prettyCount: 1,
    },
  }
  assert({ actual, expected })

  // test formatting of files
  {
    const actual = {
      uglyJsonFileContent: await readFile(uglyJsonFileUrl),
      uglyMarkdownFileContent: await readFile(uglyMarkdownFileUrl),
      uglyJavaScriptFileContent: await readFile(uglyJavaScriptFileUrl),
      uglyCssFileContent: await readFile(uglyCssFileUrl),
      uglyYamlFileContent: await readFile(uglyYamlFileUrl),
      uglyHtmlFileContent: await readFile(uglyHtmlFileUrl),
      uglyJsxFileContent: await readFile(uglyJsxFileUrl),
    }
    const expected = {
      uglyJsonFileContent: `{}
`,
      uglyMarkdownFileContent: `## Title
`,
      uglyJavaScriptFileContent: `export const a = true
`,
      uglyCssFileContent: `body {
  background-color: red;
}
`,
      uglyYamlFileContent: `foo: 1
`,
      uglyHtmlFileContent: `<div></div>
`,
      uglyJsxFileContent: `const el = <Foo attr={10}></Foo>
`,
    }
    assert({ actual, expected })
  }

  await ensureEmptyDirectory(tempDirectoryUrl)
}
