//
// This script prepares node_modules/bb2 directory to emulate bb2 package
// installed by:
// $npm install bb2
// command, but using *LOCAL* files.
//

const fs   = require('fs-extra')
const glob = require('glob')
const path = require('path')

// Prepare clean, empty node_modules directory.
console.log('Preparing node_modules directory...')
fs.removeSync('./node_modules')
fs.mkdirpSync('./node_modules')
fs.mkdirpSync('./node_modules/bb2')

// Copy js files to node_modules/bb2.
glob.sync('../src/*').forEach((item) => {
  const fname = path.basename(item)
  console.log('Copying [', fname, ']...')
  fs.copySync(item, './node_modules/bb2/' + fname)
})

// Copy package.json from root.
console.log('Copying [ package.json ]...')
fs.copySync('../package.json', './node_modules/bb2/package.json')

// Success!
console.log('Done! Now You can run one of \'example_xxx.js\' script and see BB Code 2.0 in action!')
