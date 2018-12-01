// example_chemistry.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()

console.log(bb.parse(
  'This example uses [b]bottom indexes[/] to render chemical reaction:\n' +
  '2 H[sub]2[/] + O[sub]2[/] => 2 H[sub]2[/]O'
))
