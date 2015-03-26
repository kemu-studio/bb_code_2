fs = require('fs-extra')

fs.copy 'src/lib', '../node_publish/src', (err) ->
  console.log 'DONE with err:', err