import { assert } from "@jsenv/assert"
import { ensureEmptyDirectory, resolveUrl, writeFile } from "@jsenv/util"
import { prettierCheckProject, jsenvProjectFilesConfig } from "../../index.js"

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
  const uglyAndIgnoredJavaScriptFileUrl = resolveUrl("node_modules/ugly.js", tempDirectoryUrl)
  await writeFile(uglyJsonFileUrl, `{  }`)
  await writeFile(uglyMarkdownFileUrl, `##Title`)
  await writeFile(uglyJavaScriptFileUrl, `export const a = true;`)
  await writeFile(textFileUrl, `hello world`)
  await writeFile(uglyCssFileUrl, `body { background: red; }`)
  await writeFile(uglyYamlFileUrl, `foo:1`)
  await writeFile(uglyHtmlFileUrl, `<div></div>`)
  await writeFile(uglyJsxFileUrl, `<Foo attr={10}></Foo>`)
  await writeFile(prettyJavaScriptFileUrl, `export const a = true`)
  await writeFile(erroredJavaScriptFileUrl, `export const a = (`)
  await writeFile(uglyAndIgnoredJavaScriptFileUrl, `export const a = true;`)

  // we must also ensure auto formatting of the files
  const actual = await prettierCheckProject({
    // logLevel: "off",
    projectDirectoryUrl: tempDirectoryUrl,
    projectFilesConfig: {
      ...jsenvProjectFilesConfig,
      "./basic.test.js": false,
    },
  })
  const expected = {
    report: actual.report,
    summary: {
      totalCount: 6,
      erroredCount: 1,
      ignoredCount: 0,
      uglyCount: 1,
      prettyCount: 4,
    },
  }
  assert({ actual, expected })
  await ensureEmptyDirectory(tempDirectoryUrl)
}
