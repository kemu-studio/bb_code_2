// example_list.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()

console.log(bb.parse('This is [link url="ke.mu"]example link[/].'))
console.log(bb.parse('This is [link open url="calculla.com"]another link[/], but this one will be open in new browser tab.'))
