//
// This script prepares node_modules/bb2 directory to emulate bb2 package
// installed by:
// $npm install bb2
// command, but using *LOCAL* files.
//

const fs   = require('fs-extra')
const glob = require('glob')
const path = require('path')
const exec = require('child_process').execSync

const GALLERY_HTML_FILE = './gallery.html'

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

// Prepare gallery HTML file with all examples rendered.
fs.writeFileSync(GALLERY_HTML_FILE, '')

glob.sync('./example_*.js').forEach((item) => {
  const fname = path.basename(item)
  console.log('Rendering [', fname, ']...')

  // Added header before each file.
  fs.appendFileSync(GALLERY_HTML_FILE, '<hr><a href="' + item + '">' + fname + '</a>:<br><br>')

  // Render script to file.
  exec('node ' + item + ' >> ' + GALLERY_HTML_FILE)
})

// Success!
console.log('')
console.log('Done! Now You can *RUN* one of \'example_xxx.js\' script and see BB Code 2.0 in action!')
console.log('Alternatively, you can open the \'gallery.html\' file in your browser and *SEE* what BB Code 2.0 can do for you.')
