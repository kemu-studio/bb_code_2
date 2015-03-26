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

## Quick example... more ?
...and a lot more. More examples of simplicity and smart parsing in [full BB2 documentation](http://doc.ke.mu/doc/bb/the_idea#simpleCode)

# Implementation
There are two implementations: for javascript (node.js) and for PHP.
I didn't publish PHP implementation yet - it's ongoing.

## KBB on node.js
### Instalation
    
    npm install bb2

Also make sure you have CoffeeScript installed globally (it's adviced to have CoffeeScript installed globally). If not:

    npm install -g coffee-script

### Usage

Quick usage:
```
BBCodeHtml = require('bb2').BBCodeHtml
bb = new BBCodeHtml()
console.log bb.parse('visible [0]invisible[1] [b]bold[/] [i]italic[/]')
```

For details go to http://doc.ke.mu/doc/bb

