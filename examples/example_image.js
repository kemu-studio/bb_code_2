// example_image.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()

console.log(bb.parse(
  'This is example [b]image[/]:\n' +
  ' [img' +
  ' src="http://calculla.com/g/calculla_logo_32.svg"' +
  ' alt="Calculla: Smart online calculators"][/]'
))
