[![NPM version](http://img.shields.io/npm/v/bb2.svg?style=flat)](https://npmjs.org/package/bb2)
[![Git Commit](https://img.shields.io/github/last-commit/yosheeck/bb_code_2.svg?style=flat)](https://github.com/yosheeck/bb_code_2/commits/master)
[![Git Releases](https://img.shields.io/github/release/yosheeck/bb_code_2.svg?style=flat)](https://github.com/yosheeck/bb_code_2/releases)
[![Docker pulls](https://img.shields.io/docker/pulls/yosheeck/bb_code_2.svg?style=flat)](https://hub.docker.com/r/yosheeck/bb_code_2)
[![CircleCI](https://circleci.com/gh/yosheeck/bb_code_2.svg?style=svg)](https://app.circleci.com/pipelines/github/yosheeck/bb_code_2)

This is JavaScript implementation of BBCode 2.0.

# What's BB Code 2.0 (aka KBB)
**BBCode** is a lightweight markup language, introduced in 1998. It is base markup for phpBB forum system and vBulletin. Read more [about BBCode on wikipedia](https://en.wikipedia.org/wiki/BBCode)

**BBCode 2.0** is a new modern redefinition of BBCode. It introduces smart closing of tags, relaxes tags structure, introduces number of extensions and simplifies adding custom extensions.

It is alternative to other markup languages:
* it's more structural, extendable and verbose than [markdown](https://en.wikipedia.org/wiki/Markdown)
* less structural and verbose than HTML

Therefore, the main use is for professional users: it's markup language and rich-text content description for server and browser, which can be rendered to HTML and SVG, as tags/text or directly into DOM.

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
To run examples, run this *ONCE*:
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
- [x] **remove Coffeescript dependency** - full rewrite to ES6 completed
- [ ] **more functional approach** - current one is OOP classes with inheritance. We will rewrite it to functional approach, to allow easier composition, like adding specific bb-tags without need of class-extend
- [ ] **separate parsing from rendering** - currently parsing code and rendering code are closely coupled. We'll separate them to 2 functional blocks: parsing (to AST) and rendering (from AST)
- [ ] **move rendering from text based to Nate based** - instead of building big HTML-strings, we'll use [Nate](https://www.npmjs.com/package/knate) to allow Universal building: direct DOM in the browser, HTML on server-side, LaTeX when needed, even SVG if possible
- [ ] **smart-table tags** - smart creation of tables

# Authors
* Roman Pietrzak aka yosh - Architecture, Code, Tests, Documentation
* Sylwester Wysocki aka dzik - Code, Tests, Examples

This project is sponsored by [Kemu Studio](http://ke.mu) and used as main rich-text engine in [Calculla](http://calculla.com).
