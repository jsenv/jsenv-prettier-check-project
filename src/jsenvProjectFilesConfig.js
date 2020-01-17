/**
 * This object decribes th usual files structure used in jsenv projects.
 *
 * It means files inside .github/, docs/, src/, test/ and root files
 * will be formatted with prettier when supported.
 *
 * If a project has an other directory containing files that should be formatted
 * by prettier it can be added by doing
 *
 * {
 *   ...jsenvProjectFilesConfig,
 *   './directory/': true
 * }
 *
 */

export const jsenvProjectFilesConfig = {
  "./.github/": true,
  "./docs/": true,
  "./src/": true,
  "./test/": true,
  "./script/": true,
  "./*": true,

  "./node_modules/": false, // just to be safe exclude node_modules
  "./.git/": false, // and git folder
}
