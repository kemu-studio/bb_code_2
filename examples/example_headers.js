// example_headers.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()

console.log(bb.parse(
  '[h1]Chapter I: Tale about one big chapter[/]' +
    '[p]A long time ago there was one big chapter with two subsections.[/]' +

    '[h2]1. There were two of them[/]' +
      '[p]Two subsections lived far behind the mountains behind forests and behind seven rivers.[/]' +

      '[h3]1.a. First subsection[/]' +
        '[p]First subsection likes letters, especially A,B and C.\n' +
        '[i]AAAAAA BBBBB CCCCC![/] - first subsection says.[/][/]' +

      '[h3]1.b. Second subsection[/]' +
        '[p]Second subsection likes digits, especially 1, 2 and 3.\n' +
        '[i]111111 22222 33333![/] - second subsection thinks.[/][/]'
))
