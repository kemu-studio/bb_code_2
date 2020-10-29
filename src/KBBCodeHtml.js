(function () {

  // Is it server or browser?
  let K = null

  if (typeof exports !== 'undefined' && exports !== null) {
  // Server - load K namespace from npm package.
    K = require('@kmu/kcore')
    require('./KBBCode')
  }
  else {
  // Browser.
    K = window.K
  }

  // help solve strange cases, where K.BBCode has not been properly included - e.g.
  // something went wrong with kcore
  if (K.Object.isUndefinedOrNull(K.BBCode)) {
    console.log('K.BBCode class not found, probably kcore or KBBCode has not been included')
  }

  K.BBCodeHtml = class K_BBCodeHtml extends K.BBCode {
    constructor(inSetup = {}) {
      const setup = {}
      K.Object.merge(setup, K.BBCodeHtml.DEFAULT_SETUP)
      K.Object.merge(setup, inSetup)
      super(setup)
      this._clearHtmlData()
    }

    _clearHtmlData() {
      this.htmlStack = []
      this.htmlData  = {
        depth: {
          b: 0,
          i: 0,
          u: 0,
          p: 0,
          h1: 0,
          h2: 0,
          h3: 0,
          h4: 0,
          h5: 0,
          h6: 0,
          li: 0,
          a: 0,
          img: 0,
          sub: 0,
          sup: 0
        },
        liGoDeeper: 0,
        skipLineBreak: 0,
      }
    }

    _htmlStack_findByHtmlIdFromTop(htmlId) {
      for (let idx = this.htmlStack.length - 1; idx >= 0; idx--) {
        if (this.htmlStack[idx].htmlId == htmlId) {
          return idx
        }
      }

      return -1
    }

    _htmlStack_applyByIdx(state, stackIdx) {
      const htmlAction = this.htmlStack[stackIdx]

      if (htmlAction.type == 'openClose') {
        const htmlId = htmlAction.htmlId

        let htmlEx = ''

        if (K.Object.isNotNull(htmlAction.htmlEx)) {
          htmlEx = htmlAction.htmlEx
        }

        switch (htmlId) {
        case 'b':
        case 'i':
        case 'u':
        case 'p':
        case 'sub':
        case 'sup':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        {
          state.out += '<' + htmlId + htmlEx + '>'

          break
        }
        }
      }
    }

    _htmlStack_unapplyByIdx(state, stackIdx) {
      const htmlAction = this.htmlStack[stackIdx]

      if (htmlAction.type == 'openClose') {
        const htmlId = htmlAction['htmlId']

        switch (htmlId) {
        case 'b':
        case 'i':
        case 'u':
        case 'p':
        case 'sub':
        case 'sup':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        {
          state.out += '</' + htmlId + '>'

          break
        }

        case 'li':
        {
          state.out += '</li></ul>'

          break
        }

        case 'img':
        {
          const url         = state.out.substr(this.htmlData.img.stateOutLen)
          const prefixedUrl = this.setup.imgUrl + url

          state.out = state.out.substr(0, this.htmlData.img.stateOutLen)
          state.out += '<img src="' + prefixedUrl + '"' + this.htmlData.img.exArgs + '/>'

          break
        }

        case 'a':
        {
          // if there was no text inside of link bb-code, then
          // simply emit url once again

          if (this.htmlData.outLenDuringATag == state.out.length) {
            state.out += this.htmlData.urlDuringATag
          }

          state.out += '</a>'

          break
        }
        }
      }
    }

    _htmlStack_removeByIdx(state, stackIdx) {
      this._htmlStack_unapplyByIdx(state, stackIdx)

      this.htmlStack.splice(stackIdx, 1)
    }

    _htmlStack_closeById(state, htmlId) {
      const htmlActionIdx = this._htmlStack_findByHtmlIdFromTop(htmlId)

      if (htmlActionIdx >= 0) {
      // un-apply all items from top till the one we want to close
        for (let idx = this.htmlStack.length - 1; idx >= htmlActionIdx + 1; idx--) {
          this._htmlStack_unapplyByIdx(state, idx)
        }

        // remove the item from the stack
        this._htmlStack_removeByIdx(state, htmlActionIdx)


        // reapply all items previously un-applied
        for (let idx = htmlActionIdx; idx <= this.htmlStack.length - 1; idx++) {
          this._htmlStack_applyByIdx(state, idx)
        }
      }
    }

    _htmlStack_push(state, htmlAction) {
      this.htmlStack.push(htmlAction)

      this._htmlStack_applyByIdx(state, this.htmlStack.length - 1)
    }

    _htmlStack_executeClose(state, command) {
    // execute the close of a command itself
      switch(command) {
      case 'b':
      case 'i':
      case 'u':
      case 'p':
      case 'sub':
      case 'sup':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'a':
      case 'img':
      {
        // if there is command of that type on the stack, then pop it
        if (this.htmlData['depth'][command] > 0) {
          this._htmlStack_closeById(state, command)

          this.htmlData['depth'][command] = 0
        }

        break
      }

      case 'li':
      {
        if (this.htmlData['depth'].li > 0) {
          this._htmlStack_closeById(state, command)

          this.htmlData['depth'].li--
        }

        break
      }

      default:
      {
        this._htmlStack_closeById(state, command)
      }
      }

      // after some commands we force ignoring of following line-break
      switch (command) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'li':
      case 'p':
      case 'ul':
      {
        this.htmlData.skipLineBreak = 1

        break
      }
      }
    }

    _htmlStack_closeAtTop(state) {
      const topIdx = this.htmlStack.length - 1

      if (topIdx >= 0) {
        this._htmlStack_executeClose(state, this.htmlStack[topIdx].htmlId)
      }
    }

    _htmlEmitAhref(state, params) {
      let moreTxt = ''

      if ((params.command == 'linkin') && (params.target == '')) {
        if (this.setup.blockOnClickOnInternalLinks) {
          moreTxt += ' ' + K.LinksUtil.getOnClickEventBlockerTxt()
        }

        if (this.setup.passLinkDataOnInternalLinks) {
          moreTxt += ' ' + K.LinksUtil.getLinkAsDataParam(params.plainUrl)
        }
      }

      state.out += '<a href="' + params.prefixedUrl + '"' + params.target + params.htmlClass + moreTxt + '>'
    }

    _htmlCommonHtmlArgsParse(args) {
      let htmlEx = ''

      // get the class param, if exists
      if (this._argsIsKey(args, 'class')) {
        htmlEx += ' class="' + this._argsGetValue(args, 'class') + '"'
      }

      // get the id param, if exists
      if (this._argsIsKey(args, 'id')) {
        htmlEx += ' id="' + this._argsGetValue(args, 'id') + '"'
      }

      return htmlEx
    }

    _parseBBCommand(state, command, prefix) {
    // most of the code below needs empty "args" array
      const args = []

      if (prefix == '') {
      // opener - no prefix
        switch (command) {
        case 'b':
        case 'i':
        case 'u':
        case 'p':
        case 'sub':
        case 'sup':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        {
          this._parseBBCommandArgs(state, command, prefix, args)

          const htmlEx = this._htmlCommonHtmlArgsParse(args)

          if (this.htmlData.depth[command] == 0) {
            this._htmlStack_push(state, {type:'openClose', htmlId: command, htmlEx: htmlEx})
          }

          this.htmlData.depth[command]++

          break
        }

        case 'li':
        {
          this._parseBBCommandArgs(state, command, prefix, args)

          if (this.htmlData.depth.li == 0) {
            this._htmlStack_push(state, {type:'openClose', htmlId: 'li'})
            state.out += '<ul><li>'
            this.htmlData.depth.li = 1
          }
          else if (this.htmlData.depth.li > 0) {
            // if there was [ul] just recently, which goes "deeper"
            if (this.htmlData.liGoDeeper) {
              this._htmlStack_push(state, {type:'openClose', htmlId: 'li'})
              state.out += '<ul><li>'
              this.htmlData.liGoDeeper = 0
              this.htmlData.depth.li++
            }
            else {
              state.out += '</li><li>'
            }
          }

          break
        }

        case 'ul':
        {
          this.htmlData.skipLineBreak = 1

          this._parseBBCommandArgs(state, command, prefix, args)

          if (this.htmlData.depth.li > 0) {
            if (this.htmlData.liGoDeeper == 0) {
              this.htmlData.liGoDeeper = 1
            }
            else {
              throw new K.BBCodeException('Cannot use html-ul after html-ul directly')
            }
          }

          break
        }

        case 'link':
        case 'linkin':
        {
          if (this.htmlData.depth.a == 0) {
            // parse params
            this._parseBBCommandArgs(state, command, prefix, args)

            const url    = this._argsGetValue(args, 'url')
            const target = this._argsIsKey(args, 'open') ? ' target="_blank"' : ''

            // is the url correct
            if (K.Object.isUndefinedOrNull(url)) {
              state.out += '?url?'
            }
            else {
              // get the class param, if exists
              let htmlClass   = ''
              let prefixedUrl = ''

              if (this._argsIsKey(args, 'class')) {
                htmlClass = ' class="' + this._argsGetValue(args, 'class') + '"'
              }

              // create correct prefixed url
              if (command == 'link') {
                if ((url.substr(0, 7) == 'http://') || (url.substr(0, 8) == 'https://')) {
                  prefixedUrl = url
                }
                else {
                  prefixedUrl = 'http://' + url
                }
              }
              else {
                // the command is 'linkin'
                prefixedUrl = this.setup.innerUrl + url
              }

              // push outputs
              this._htmlStack_push(state, {type:'openClose', htmlId: 'a'})

              this._htmlEmitAhref(state, {
                command: command,
                prefixedUrl: prefixedUrl,
                plainUrl: url,
                target: target,
                htmlClass: htmlClass
              })

              this.htmlData.depth.a          = 1
              this.htmlData.outLenDuringATag = state.out.length
              this.htmlData.urlDuringATag    = url
            }
          }

          break
        }

        case 'img':
        {
          this._parseBBCommandArgs(state, command, prefix, args)

          let htmlEx = this._htmlCommonHtmlArgsParse(args)

          // get the alt param, if exists
          if (this._argsIsKey(args, 'alt')) {
            htmlEx += ' alt="' + this._argsGetValue(args, 'alt') + '"'
          }

          // look for src param
          if (this._argsIsKey(args, 'src')) {
            const url         = this._argsGetValue(args, 'src')
            const prefixedUrl = this.setup.imgUrl + url
            state.out += '<img src="' + prefixedUrl + '"' + htmlEx + '/>'
          }
          else {
            // src not present - look for closing tag
            if (this.htmlData.depth.img == 0) {
              this._htmlStack_push(state, {type:'openClose', htmlId: 'img'})
              this.htmlData.img = {exArgs: htmlEx, stateOutLen: state.out.length}
              this.htmlData.depth.img = 1
            }
          }

          break
        }

        case 'target':
        {
          this._parseBBCommandArgs(state, command, prefix, args)
          state.out += '<a name="' + this._argsGetValue(args, 'id') + '"></a>'
          this.htmlData.skipLineBreak = 1

          break
        }

        default:
        {
          // unhandled stuff
          super._parseBBCommand(state, command, prefix)
        }
        }
      }
      else if (prefix == '/') {
      // closer - prefix is "/""
        switch (command) {
        case 'b':
        case 'i':
        case 'u':
        case 'p':
        case 'sub':
        case 'sup':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        {
          this._parseBBCommandArgs(state, command, prefix, args)
          this._htmlStack_executeClose(state, command)

          break
        }

        case 'li':
        {
          // closing of li is simply ignored
          this._parseBBCommandArgs(state, command, prefix, args)

          break
        }

        case 'ul':
        {
          this._parseBBCommandArgs(state, command, prefix, args)
          this._htmlStack_executeClose(state, 'li')

          break
        }

        case 'link':
        case 'linkin':
        {
          this._parseBBCommandArgs(state, command, prefix, args)
          this._htmlStack_executeClose(state, 'a')

          break
        }

        case 'img':
        {
          this._parseBBCommandArgs(state, command, prefix, args)
          this._htmlStack_executeClose(state, 'img')

          break
        }

        case '':
        {
          // anonymous close - remove one item from top of the stack
          this._parseBBCommandArgs(state, command, prefix, args)
          this._htmlStack_closeAtTop(state)

          break
        }

        default:
        {
          // unhandled stuff
          super._parseBBCommand(state, command, prefix)
        }
        }
      }
    }

    _parseText(state) {
    // prepare correct regexp according to configuration
      let PARSE_TEXT_TILL = null

      if (this.setup.allowDirectHtml) {
        PARSE_TEXT_TILL = new RegExp('[^\[\n\r\t]*', 'g')
      }
      else {
        PARSE_TEXT_TILL = new RegExp('[^\[\n\r\t&"\'<>]*', 'g')
      }

      // parse everything that's considered to be text (passed through)
      PARSE_TEXT_TILL.lastIndex = state.srcIdx

      const regexpResult = PARSE_TEXT_TILL.exec(state.src)

      if (K.Object.isNotNull(regexpResult) && (regexpResult[0].length > 0)) {
        state.srcIdx += regexpResult[0].length
        state.out    += regexpResult[0]
        this.htmlData.skipLineBreak = 0
      }

      // look what's next, right after "clean" text and handle it
      if (state.srcIdx < state.src.length) {
        const c = state.src.charAt(state.srcIdx)

        switch (c) {
        case '[':
        {
          // do nothing
          break
        }

        case '\n':
        {
          // line-breaking depends on previously parsed tags
          // (for example: no linebreak right after [h1][/])
          if (this.htmlData.skipLineBreak == 0) {
            if (this.setup.lbToBrEnabled) {
              state.out += '<br>'
            }
          }
          else {
            this.htmlData.skipLineBreak = 0
          }

          state.srcIdx++

          break
        }

        case '\r':
        {
          state.srcIdx++

          break
        }

        case '<':
        {
          state.out += '&lt;'
          state.srcIdx++

          break
        }

        case '>':
        {
          state.out += '&gt;'
          state.srcIdx++

          break
        }

        case '&':
        {
          state.out += '&amp;'
          state.srcIdx++

          break
        }

        case '"':
        {
          state.out += '&quot;'
          state.srcIdx++

          break
        }

        case '\'':
        {
          state.out += '&#039;'
          state.srcIdx++

          break
        }

        default:
        {
          state.srcIdx++
        }
        }
      }
    }

    _parseBB(state) {
      super._parseBB(state)

      // close unclosed tags
      while (this.htmlStack.length > 0) {
        this._htmlStack_removeByIdx(state, this.htmlStack.length - 1)
      }
    }

    parse(src) {
      this._clearHtmlData()

      return super.parse(src)
    }
  }

  // Class constants.
  K.BBCodeHtml.DEFAULT_SETUP = {
    allowDirectHtml: false,
    innerUrl: '',
    imgUrl: '',
    lbToBrEnabled: true,
    blockOnClickOnInternalLinks: false,
    passLinkDataOnInternalLinks: false
  }

  exports.BBCodeHtml = K.BBCodeHtml

})(this)
