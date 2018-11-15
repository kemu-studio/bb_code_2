/* global test */
/* global suite */

let K = null

if (typeof exports !== 'undefined' && exports !== null) {
  // Server - load K namespace from npm package.
  K = require('kcore')
  require('../src/KBBCodeHtml')
  require('should')
}
else {
  // Browser.
  K = window.K
}

class BBCodeTest extends K.BBCode {
  constructor() {
    super()
    this.clearTestValue()
  }

  clearTestValue() {
    this.testValue = {
      defaultBBCalledCnt: 0,
      prefixedCnt: {},
      tags: []
    }
  }

  getTestValue() {
    return this.testValue
  }

  _parseBBCommand(state, command, prefix) {
    if (prefix != '') {
      if ((typeof (this.testValue.prefixedCnt[prefix]) != 'undefined') &&
          (this.testValue.prefixedCnt[prefix] != null)) {
        this.testValue.prefixedCnt[prefix]++
      }
      else {
        this.testValue.prefixedCnt[prefix] = 1
      }
    }

    switch (command) {
    case 'open':
    {
      const args   = []
      const theTag = {command:command, args:args}
      this.testValue.tags.push(theTag)
      this._parseBBCommandArgs(state, command, prefix, args)

      break
    }

    default:
    {
      super._parseBBCommand(state, command, prefix)
      this.testValue.defaultBBCalledCnt++
    }
    }

    return state
  }
}

suite('KBBCode', () => {
  test('empty BB', () => {
    const bb = new K.BBCode
    bb.parse('').should.be.eql('')
  })

  test( 'simple strings - not a real BB', () => {
    const bb = new K.BBCode()
    bb.parse('x').should.be.eql('x')
    bb.parse('abc').should.be.eql('abc')
    bb.parse('abc ab!').should.be.eql('abc ab!')
    bb.parse('¬~#3').should.be.eql('¬~#3')
  })

  test('[[ -> [ conversion - not a real BB yet', () => {
    const bb = new K.BBCode()
    bb.parse('[[').should.be.eql('[')
    bb.parse('[[[[').should.be.eql('[[')
    bb.parse('x[[x[[').should.be.eql('x[x[')
    bb.parse('[[x[[x').should.be.eql('[x[x')
    bb.parse('[[x[[x[[[[yy').should.be.eql('[x[x[[yy')
    bb.parse('x ac! [[[[x[[[[[[ [[').should.be.eql('x ac! [[x[[[ [')
  })

  test('simple commands - fake command parser class', () => {
    const bb = new BBCodeTest()
    bb.parse('[x]').should.be.eql('[x]')
    bb.getTestValue().prefixedCnt.should.be.eql({})
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)

    bb.clearTestValue()
    bb.parse('[abcdef]').should.be.eql('[abcdef]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)

    bb.clearTestValue()
    bb.parse('[ abc]').should.be.eql('[ abc]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(0)

    bb.clearTestValue()
    bb.parse('xyz hafahafa [abcdef]').should.be.eql('xyz hafahafa [abcdef]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)

    bb.clearTestValue()
    bb.parse('[xyz] hafahafa ! [ abcdef]').should.be.eql('[xyz] hafahafa ! [ abcdef]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)
  })

  test('simple commands + [[ in random places', () => {
    const bb = new BBCodeTest()
    bb.parse('[[[xabcde10_boogabooga]').should.be.eql('[[xabcde10_boogabooga]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)

    bb.clearTestValue()
    bb.parse(' [x]abc hgw[[ [').should.be.eql(' [x]abc hgw[ [')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)

    bb.clearTestValue()
    bb.parse(' [x]abc hgw[[ [y]').should.be.eql(' [x]abc hgw[ [y]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(2)

    bb.clearTestValue()
    bb.parse(' [x]abc hgw[[ [y]').should.be.eql(' [x]abc hgw[ [y]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(2)
  })

  test('simple commands - more advanced cases (like multiple lines)', () => {
    const bb = new BBCodeTest()
    bb.parse(' go [to] nowhere\n [with] this \r [test]\r\n').should.be.eql(' go [to] nowhere\n [with] this \r [test]\r\n')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(3)
  })

  test('simple commands - prefixes parsing', () => {
    const bb = new BBCodeTest()
    bb.parse('[!x]').should.be.eql('[!x]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)
    bb.getTestValue().prefixedCnt.should.be.eql({'!':1})

    bb.clearTestValue()
    bb.parse('[@x]').should.be.eql('[@x]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(0)

    bb.clearTestValue()
    bb.parse(' [-x]abc hgw[[ [+y]').should.be.eql(' [-x]abc hgw[ [+y]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(2)
    bb.getTestValue().prefixedCnt.should.be.eql({'-':1, '+':1})
  })

  test('commands with some more text inside', () => {
    const bb = new BBCodeTest()
    bb.parse('[x;y]').should.be.eql('[x;y]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(1)

    bb.clearTestValue()
    bb.parse('[x="z"][y asd+ ni="x"][\\x][-y]').should.be.eql('[x="z"][y asd+ ni="x"][\\x][-y]')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(4)
    bb.getTestValue().prefixedCnt.should.be.eql({'\\':1, '-':1})
  })

  test('command parameters parser: command + whitespace', () => {
    const bb = new BBCodeTest()
    bb.parse('[open ] x ').should.be.eql(' x ')
    bb.getTestValue().defaultBBCalledCnt.should.be.eql(0)
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([])
  })

  test('command parameters parser: commands + simple words as command arguments', () => {
    const bb = new BBCodeTest()
    bb.parse('[open aA  bcd] x ').should.be.eql(' x ')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aA', value:null}, {key:'bcd', value:null}])
  })

  test('command parameters parser: commands + real params', () => {
    const bb = new BBCodeTest()
    bb.parse('[open aa=1 bb= abc] x ').should.be.eql(' x ')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aa', value:'1'}, {key:'bb', value:'abc'}])

    bb.clearTestValue()
    bb.parse('[open aa=abc bb=xx] x ').should.be.eql(' x ')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aa', value:'abc'}, {key:'bb', value:'xx'}])
  })

  test('command parameters parser: commands + params with quotes', () => {
    const bb = new BBCodeTest()
    bb.parse('[open aa="zxy" b_b=\'allah akbar boom\'] x ').should.be.eql(' x ')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aa', value:'zxy'}, {key:'b_b', value:'allah akbar boom'}])

    bb.clearTestValue()
    bb.parse('[open aa="zx\'y" b_b= \'abc bah "boom\'] x hgw[open key="va\'lue"]').should.be.eql(' x hgw')
    bb.getTestValue().tags.length.should.be.eql(2)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aa', value:'zx\'y'}, {key:'b_b', value:'abc bah "boom'}])
    bb.getTestValue().tags[1].command.should.be.eql('open')
    bb.getTestValue().tags[1].args.should.be.eql([{key:'key', value:'va\'lue'}])
  })

  test('command parameters parser: commands + params with quotes inside quotes', () => {
    const bb = new BBCodeTest()
    bb.parse('[open aa=\'zx\'\'y\'] x x').should.be.eql(' x x')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aa', value:'zx\'y'}])

    bb.clearTestValue()
    bb.parse('[open aa="zx""y" cde=\'x\'\'y\'] x x').should.be.eql(' x x')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'aa', value:'zx"y'},{key:'cde', value:'x\'y'}])
  })

  test('syntax error: tag + illegal character', () => {
    const bb = new BBCodeTest()
    bb.parse('ala [open !').should.be.eql('ala [open ')
    bb.getTestValue().tags.length.should.be.eql(1)
  })

  test('syntax error: never closed the bracket', () => {
    const bb = new BBCodeTest()
    bb.parse('ala [open x').should.be.eql('ala [open x')
    bb.getTestValue().tags.length.should.be.eql(1)
    bb.getTestValue().tags[0].command.should.be.eql('open')
    bb.getTestValue().tags[0].args.should.be.eql([{key:'x', value:null}])

    bb.parse('ala [open x=').should.be.eql('ala [open x=')
    bb.parse('ala [open x= ').should.be.eql('ala [open x= ')
    bb.parse('ala [open x= "').should.be.eql('ala [open x= "')
    bb.parse('ala [open x= ""').should.be.eql('ala [open x= ""')
    bb.parse('ala [open x=""').should.be.eql('ala [open x=""')
    bb.parse('ala [open x= \'').should.be.eql('ala [open x= \'')
    bb.parse('ala [open x=\'').should.be.eql('ala [open x=\'')
    bb.parse('ala [open x=\'\'').should.be.eql('ala [open x=\'\'')
    bb.parse('ala [open x=\'\' y=\'\'\'\'').should.be.eql('ala [open x=\'\' y=\'\'\'\'')
  })

  test('syntax error: no key, just quoted value', () => {
    const bb = new BBCodeTest()
    bb.parse('[open \'abc bah boom\'] x').should.be.eql('[open ')
  })

  test('BB native command: [0]skip me[1]', () => {
    const bb = new BBCodeTest()
    bb.parse('[1]').should.be.eql('')
    bb.parse('a[1]n[1]').should.be.eql('an')
    bb.parse('a[0]n[1]b').should.be.eql('ab')
    bb.parse('a[0]n').should.be.eql('a')
    bb.parse('a[0]n[0]b[1]c[0]x').should.be.eql('ac')
    bb.parse('1\n[0]\n\n[1]\n2').should.be.eql('1\n2')
  })
})

suite('KBBCodeHtml', () => {
  test('simple stuff - not HTML yet', () => {
    const bb = new K.BBCodeHtml()
    bb.parse('').should.be.eql('')
    bb.parse('abc').should.be.eql('abc')
  })

  test('bb-html: [b][i][u] mess', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('').should.be.eql('')
    bb.parse('abc[b]x[/b]').should.be.eql('abc<b>x</b>')
    bb.parse('abc[b]y').should.be.eql('abc<b>y</b>')
    bb.parse('abc[b][i]xy').should.be.eql('abc<b><i>xy</i></b>')
    bb.parse('abc[b][i]xy[/i]').should.be.eql('abc<b><i>xy</i></b>')
    bb.parse('abc[b][i]xy[/i][/b]').should.be.eql('abc<b><i>xy</i></b>')
    bb.parse('abc[b][i]xy[/b]').should.be.eql('abc<b><i>xy</i></b><i></i>')
    bb.parse('abc[b][i]xy[/b ][/i]').should.be.eql('abc<b><i>xy</i></b><i></i>')
    bb.parse('abc[b][u][i]ble[/b][/i]x[/u]').should.be.eql('abc<b><u><i>ble</i></u></b><u><i></i>x</u>')
    bb.parse('abc[b]what[/b][/b][/b]').should.be.eql('abc<b>what</b>')
  })

  test('bb-html: anonymous close [/]', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('abc[b]x[/]').should.be.eql('abc<b>x</b>')
    bb.parse('abc[b][i]x[/]y[/]z').should.be.eql('abc<b><i>x</i>y</b>z')
    bb.parse('abc[b][i]x[/]y[i]z[/]f[/]a').should.be.eql('abc<b><i>x</i>y<i>z</i>f</b>a')
  })

  test('bb-html: unhandled non-tags [/]', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('abc[x]y').should.be.eql('abc[x]y')
    bb.parse('abc[x]y[/]').should.be.eql('abc[x]y')
  })

  test('bb-html: simple tag [h]', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('abc[h1]x[/h1]').should.be.eql('abc<h1>x</h1>')
    bb.parse('abc[h2]x[/]').should.be.eql('abc<h2>x</h2>')
    bb.parse('abc[h3]x[/h1]').should.be.eql('abc<h3>x</h3>')
    bb.parse('abc[h4]x[/]').should.be.eql('abc<h4>x</h4>')
    bb.parse('abc[h5]x[/h1]').should.be.eql('abc<h5>x</h5>')
    bb.parse('abc[h6]x[/]').should.be.eql('abc<h6>x</h6>')
  })

  test('bb-html: simple tag [p]', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('abc[p]x[/p]').should.be.eql('abc<p>x</p>')
    bb.parse('abc[p]x[/]').should.be.eql('abc<p>x</p>')
    bb.parse('abc[p]xa[/p]xb[p]xc[/]').should.be.eql('abc<p>xa</p>xb<p>xc</p>')
  })

  test('bb-html: simple tag [sub]', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('abc[sub]x[/sub]').should.be.eql('abc<sub>x</sub>')
    bb.parse('abc[sub]x[/]').should.be.eql('abc<sub>x</sub>')
    bb.parse('abc[sub]xa[/sub]xb[sub]xc[/]').should.be.eql('abc<sub>xa</sub>xb<sub>xc</sub>')
  })

  test('bb-html: simple tag [sup]', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('abc[sup]x[/sup]').should.be.eql('abc<sup>x</sup>')
    bb.parse('abc[sup]x[/]').should.be.eql('abc<sup>x</sup>')
    bb.parse('abc[sup]xa[/sup]xb[sup]xc[/]').should.be.eql('abc<sup>xa</sup>xb<sup>xc</sup>')
  })

  test('bb-html: special characters in allowDirectHtml == false', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('[[').should.be.eql('[')
    bb.parse('&').should.be.eql('&amp;')
    bb.parse('<').should.be.eql('&lt;')
    bb.parse('>').should.be.eql('&gt;')
    bb.parse('\'').should.be.eql('&#039;')
    bb.parse('"').should.be.eql('&quot;')
    bb.parse(' &" ').should.be.eql(' &amp;&quot; ')
    bb.parse('<a href="http://ke.mu">xxx</a>').should.be.eql('&lt;a href=&quot;http://ke.mu&quot;&gt;xxx&lt;/a&gt;')
  })

  test('bb-html: special characters in allowDirectHtml == true', () => {
    const bb = new K.BBCodeHtml({allowDirectHtml:true})
    bb.THROW_EXCEPTIONS = true
    bb.parse('[[').should.be.eql('[')
    bb.parse('&').should.be.eql('&')
    bb.parse('<').should.be.eql('<')
    bb.parse('>').should.be.eql('>')
    bb.parse('\'').should.be.eql('\'')
    bb.parse('"').should.be.eql('"')
    bb.parse('<a href="http://ke.mu">xxx</a>').should.be.eql('<a href="http://ke.mu">xxx</a>')
  })

  test('bb-html: lists', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('[li]').should.be.eql('<ul><li></li></ul>')
    bb.parse('[li]x').should.be.eql('<ul><li>x</li></ul>')
    bb.parse('[li]x[/ul]').should.be.eql('<ul><li>x</li></ul>')
    bb.parse('[li]x[/ul]a').should.be.eql('<ul><li>x</li></ul>a')
    bb.parse('[li]x[/li][/ul]a').should.be.eql('<ul><li>x</li></ul>a')
    bb.parse('[ul][li]x[/li][li]y[/li][li]z[/li][/ul]').should.be.eql('<ul><li>x</li><li>y</li><li>z</li></ul>')
    bb.parse('[ul][li]x[li]y[li]z[/ul]').should.be.eql('<ul><li>x</li><li>y</li><li>z</li></ul>')
    bb.parse('[li]x[li]y[li]z[/ul]').should.be.eql('<ul><li>x</li><li>y</li><li>z</li></ul>')
  })

  test('bb-html: lists - multi-level (lists inside lists)', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true

    // simply 2 levels
    bb.parse('[li]x[ul][li]y[/ul][/ul]').should.be.eql('<ul><li>x<ul><li>y</li></ul></li></ul>')
    bb.parse('[li]x[ul][li]y[/ul]a[/ul]b').should.be.eql('<ul><li>x<ul><li>y</li></ul>a</li></ul>b')

    // 2 levels - different bb, same html
    bb.parse('[li]1[li]2[ul][li]2.1[li]2.2[/ul]aa[/ul]bb').should.be.eql('<ul><li>1</li><li>2<ul><li>2.1</li><li>2.2</li></ul>aa</li></ul>bb')
    bb.parse('[li]1[/li][li]2[/li][ul][li]2.1[/li][li]2.2[/li][/ul]aa[/ul]bb').should.be.eql('<ul><li>1</li><li>2<ul><li>2.1</li><li>2.2</li></ul>aa</li></ul>bb')
    bb.parse('[ul][li]1[/li][li]2[/li][ul][li]2.1[/li][li]2.2[/li][/ul]aa[/li][/ul]bb').should.be.eql('<ul><li>1</li><li>2<ul><li>2.1</li><li>2.2</li></ul>aa</li></ul>bb')
  })

  test('bb-html: line break handling - simple cases', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('\n').should.be.eql('<br>')
    bb.parse('\r').should.be.eql('')
    bb.parse('This \n text is \nline-breaked.').should.be.eql('This <br> text is <br>line-breaked.')
  })

  test('bb-html: line break handling - cancel line-break after closing line-breaking tags (like headers, lists, etc.)', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('This \n[h1]text is[/]\nline-breaked.').should.be.eql('This <br><h1>text is</h1>line-breaked.')
    bb.parse('This \n[h1]text is[/]\n\nline-breaked.').should.be.eql('This <br><h1>text is</h1><br>line-breaked.')
    bb.parse('This \n[h1]text is[/]x\n\nline-breaked.').should.be.eql('This <br><h1>text is</h1>x<br><br>line-breaked.')
    bb.parse('This \n[ul]\n[li]line-breaked\nitem[/].').should.be.eql('This <br><ul><li>line-breaked<br>item</li></ul>.')
  })

  test('bb-html: links', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('[link][/link]').should.be.eql('?url?')
    bb.parse('[link][/]').should.be.eql('?url?')

    bb.parse('[link url="http://ke.mu"]KEMU[/link]').should.be.eql('<a href="http://ke.mu">KEMU</a>')
    bb.parse('[link url="ke.mu"]KEMU[/link]').should.be.eql('<a href="http://ke.mu">KEMU</a>')
    bb.parse('[link url="ke.mu"][/link]').should.be.eql('<a href="http://ke.mu">ke.mu</a>')
    bb.parse('[link url="ke.mu"][/]').should.be.eql('<a href="http://ke.mu">ke.mu</a>')
    bb.parse('[link open url="http://ke.mu"][/]').should.be.eql('<a href="http://ke.mu" target="_blank">http://ke.mu</a>')

    // https support
    bb.parse('[link url="https://www.npmjs.com/package/bb2"][/]').should.be.eql('<a href="https://www.npmjs.com/package/bb2">https://www.npmjs.com/package/bb2</a>')
  })

  test('bb-html: internal links', () => {
    const bb = new K.BBCodeHtml({innerUrl:'http://ke.mu/'})
    bb.THROW_EXCEPTIONS = true
    bb.parse('[linkin][/linkin]').should.be.eql('?url?')
    bb.parse('[linkin url=the_page]The internal page[/]').should.be.eql('<a href="http://ke.mu/the_page">The internal page</a>')
    bb.parse('[linkin url=the_page][/]').should.be.eql('<a href="http://ke.mu/the_page">the_page</a>')
    bb.parse('[linkin url=the_page]').should.be.eql('<a href="http://ke.mu/the_page">the_page</a>')
  })

  test('bb-html: target', () => {
    const bb = new K.BBCodeHtml()
    bb.THROW_EXCEPTIONS = true
    bb.parse('The text [target id=thePlaceToJump] and more text.').should.be.eql('The text <a name="thePlaceToJump"></a> and more text.')
  })

  test('bb-html: image', () => {
    const bb = new K.BBCodeHtml({imgUrl:'http://ke.mu/g/'})
    bb.THROW_EXCEPTIONS = true
    bb.parse('The text [img src="the_img.jpg"] and more text.').should.be.eql('The text <img src="http://ke.mu/g/the_img.jpg"/> and more text.')
    bb.parse('[img src="the_img.jpg" class="xxx" alt="yyy"]').should.be.eql('<img src="http://ke.mu/g/the_img.jpg" class="xxx" alt="yyy"/>')
    bb.parse('The [img]the_img.png[/] image.').should.be.eql('The <img src="http://ke.mu/g/the_img.png"/> image.')
  })

  test('bb-html: generic parameters support: parameter class', () => {
    const bb = new K.BBCodeHtml({imgUrl:'http://ke.mu/g/'})
    bb.THROW_EXCEPTIONS = true

    bb.parse('[img class=abc src="the_img.jpg"]').should.be.eql('<img src="http://ke.mu/g/the_img.jpg" class="abc"/>')
    bb.parse('[h1 class=abc]xyz[/]').should.be.eql('<h1 class="abc">xyz</h1>')
  })

  test('bb-html: generic parameters support: parameter id', () => {
    const bb = new K.BBCodeHtml({imgUrl:'http://ke.mu/g/'})
    bb.THROW_EXCEPTIONS = true

    bb.parse('[h1 id=abc]xyz[/]').should.be.eql('<h1 id="abc">xyz</h1>')
    bb.parse('[img class=abc id=xxx src="the_img.jpg"]').should.be.eql('<img src="http://ke.mu/g/the_img.jpg" class="abc" id="xxx"/>')

    bb.parse('').should.be.eql('')
  })
})
