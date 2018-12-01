// example_math.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()

console.log(bb.parse(
  'This example uses [b]bottom[/] and [b]upper indexes[/] to render math formula:\n' +
  'W[sub]n[/](x)' +
  ' = a[sub]n[/]x[sup]n[/]' +
  ' + a[sub]n-1[/]x[sup]n-1[/]' +
  ' + a[sub]n-2[/]x[sup]n-2[/]' +
  ' + ...' +
  ' + a[sub]1[/]x' +
  ' + a[sub]0[/]'
))
