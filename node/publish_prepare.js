const fs = require('fs-extra');

fs.copy('src/lib', '../node_publish/src', (err) =>
{
  console.log('Copied files with err:', err);
});
