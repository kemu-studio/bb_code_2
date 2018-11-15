# example_01.coffee
BBCodeHtml = require('bb2').BBCodeHtml
bb = new BBCodeHtml()
console.log bb.parse('visible [0]invisible[1] [b]bold[/] [i]italic[/]')