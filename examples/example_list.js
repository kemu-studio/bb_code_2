// example_list.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()

console.log(bb.parse(
  // Simple items list. Please note there is no need
  // to closing each li tag explicitly.
  '[li]Item #1' +
  '[li]item #2' +

    // Nested list example. We're going to add 2.x subitems.
    '[ul][li]Item #2.1' +
    '[li]Item #2.2' +
    '[li]Item #2.3' +
    '[/ul]' +
  '[li]Item #3' +
  '[/]'
))
