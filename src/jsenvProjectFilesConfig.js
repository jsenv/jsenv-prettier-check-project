export const jsenvProjectFilesConfig = {
  "./github/": true,
  "./docs/": true,
  "./src/": true,
  "./test/": true,
  "./script/": true,
  "./*": true,

  "./node_modules/": false, // just to be safe exclude node_modules
  "./.git/": false, // and git folder
}
