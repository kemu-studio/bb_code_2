# BB Code 2.0 (aka KBB)
## Quick example
Instead of this

    This is <b>bold and <i>italic</i></b><i>or just italic</i> text.

Why not just:

    This is [b]bold and [i]italic[/b]or just italic[/i] text.

## Quick example #2
Instead of this

    This is <b><i><u>complicated</u></i></b> - because you have to watch out for the order of things.

Why not just:

    This is [b][i][u]less complicated[/][/][/] - because you just auto-close last tag.

## Quick example #3
Instead of this

    <ul><li>HTML way</li><li>of handling</li><li>lists</li></ul>

Why not just:

    [li]HTML way[li]of handling[li]lists[/]

## more examples..
More examples of simplicity and smart parsing in [full BB2 documentation](http://doc.ke.mu/doc/bb/the_idea#simpleCode)

## KBB on node.js
### Installation

    npm install bb2

Also make sure you have CoffeeScript installed globally (it's advised to have CoffeeScript installed globally). If not:

    npm install -g coffee-script

### Usage

Quick usage:
```
BBCodeHtml = require('bb2').BBCodeHtml
bb = new BBCodeHtml()
console.log bb.parse('visible [0]invisible[1] [b]bold[/] [i]italic[/]')
```

For details go to http://doc.ke.mu/doc/bb

# Other implementations
This is implementation of **bb2 in JavaScript** for node.js and browsers use.
We also implemented bb2 in PHP for our older projects, but we never had time to publish it - contact us if you're interested.

# Roadmap
- **get rid of Coffeescript dependency** - full rewrite to ES6 has been started already.
- **more functional approach** - current one is OOP with inheritance, we will rewrite it to more functional approach, to enable easier composition, like adding specific bb-tags without need of class-extend
- **move rendering from text based to Nate based** - instead of building big HTML-strings, we'll use [Nate](https://www.npmjs.com/package/knate) to allow Universal building: direct DOM in the browser and HTML on server-side
- **smart-table tags** - smart creation of tables
