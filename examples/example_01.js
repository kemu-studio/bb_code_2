// example_01.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()
console.log(bb.parse('visible [0]invisible[1] [b]bold[/] [i]italic[/] [u]underline[/]'))
