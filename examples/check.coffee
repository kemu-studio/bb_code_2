BBCode     = require('bb2').BBCode
BBCodeHtml = require('bb2').BBCodeHtml

ok = true
bb = new BBCode()
if (bb.parse('visible [0]invisible[1] visible') != 'visible  visible')
  ok = false
  console.log 'test failed'

bb = new BBCodeHtml()
if (bb.parse('text [b]bold[/]') != 'text <b>bold</b>')
  ok = false
  console.log 'test failed'

if ok
  console.log 'BB2 seems to be working !'
else
  console.log 'Total fail...'
