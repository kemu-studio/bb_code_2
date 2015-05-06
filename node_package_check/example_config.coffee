# example_config.coffee
BBCodeHtml = require('bb2').BBCodeHtml
config = {innerUrl: 'http://example.com/'}
bb = new BBCodeHtml(config)
console.log bb.parse('AAAAA [linkin url="the_internal_link"]BBBB[/] CCCC')

config = {imgUrl: 'http://example.com/gfx/'}
bb = new BBCodeHtml(config)
console.log bb.parse('AAAAA [img src="test.jpg"] CCCC')