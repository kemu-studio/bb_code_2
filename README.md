This is JavaScript implementation of BBCode 2.0.

# What's BB Code 2.0 (aka KBB)
**BBCode** is a lightweight markup language, introduced in 1998. It is base markup for phpBB forum system and vBulletin. Read more [about on BBCode wiki](https://en.wikipedia.org/wiki/BBCode)

**BBCode 2.0** is a new modern redefinition of BBCode.
It introduces smart closures, relaxes tags structure, simplifies extensions.

It is alternative to other markups.
* it's more structural, extendable and verbose than [markdown](https://en.wikipedia.org/wiki/Markdown)
* less structural and verbose than HTML

Therefore its main use is professional - as convenient, extendable definition of content for server and browser side rich-texts, before rendering to HTML or DOM.

# Examples
## Auto close
Instead of this

    This is <b><i><u>complicated</u></i></b> - because you have to remember to close everything.

Why not just

    This is [b][i][u]less complicated[/][/][/] - because you just auto-close last tag.

## Smart to-HTML destructuring
Instead of this

    This is <b>bold and <i>italic</i></b><i>or just italic</i> text.

Why not just

    This is [b]bold and [i]italic[/b]or just italic[/i] text.

## Lists
Instead of this

    <ul>
      <li>HTML way</li>
      <li>of handling</li>
      <li>lists</li>
    </ul>

Why not just

    [li]BBCode way
    [li]of handling
    [li]lists
    [/]

## more examples...
More examples in /examples folder and at [full BB2 documentation](http://doc.ke.mu/doc/bb/the_idea#simpleCode)

# BBCode-2 on node.js
## Installation

    npm install bb2

## Run tests
    
    npm test

## Usage
```
// example_basic.js
const BBCodeHtml = require('bb2').BBCodeHtml
const bb         = new BBCodeHtml()
console.log(bb.parse('visible [0]invisible[1] [b]bold[/] [i]italic[/] [u]underline[/]'))
```
## Examples
Look into /examples folder.
To run examples, first do
```
cd examples
node 0_prepare.js
```
This:
- prepares the folder structure as to pretend that's a real project. 
- creates the **gallery.html** file, which contains all the results from - just open that in the browser

After prepare, you can hit any of example_*.js like that:
```
node example_basic.js
```

For details go to http://doc.ke.mu/doc/bb

# Other implementations
This is implementation of **bb2 in JavaScript** for node.js and browsers use.
We also implemented bb2 in PHP for our older projects, but we never had time to publish it - contact us if you're interested.

# Roadmap
- [DONE] **get rid of Coffeescript dependency** - full rewrite to ES6 completed
- **more functional approach** - current one is OOP classes with inheritance, we will rewrite it to more functional approach, to allow easier composition, like adding specific bb-tags without need of class-extend
- **move rendering from text based to Nate based** - instead of building big HTML-strings, we'll use [Nate](https://www.npmjs.com/package/knate) to allow Universal building: direct DOM in the browser and HTML on server-side
- **smart-table tags** - smart creation of tables
