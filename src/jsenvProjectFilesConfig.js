export const jsenvProjectFilesConfig = {
  "./github/": true,
  "./docs/": true,
  "./src/": true, // files inside src -> check those
  "./test/": true, // files inside test -> check those
  "./*": true, // root files -> check those

  "./node_modules/": false, // just to be safe exclude node_modules
  "./.git/": false, // and git folder
}
