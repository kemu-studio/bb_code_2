if __pathToKCore?
  K = require(__pathToKCore)
  require('./KBBCode.coffee')
  K.requireLib('server/KServerCore.coffee')
else
  K = {}
  K.BBCode = require('./KBBCode.coffee').BBCode
  K.Object = require('./KObject.coffee').Object

class K.BBCodeHtml extends K.BBCode
  @DEFAULT_SETUP = {
    allowDirectHtml: false
    innerUrl: ''
    imgUrl: ''
    lbToBrEnabled: true
    blockOnClickOnInternalLinks: false
    passLinkDataOnInternalLinks: false
  }

  constructor: (inSetup = {}) ->
    setup = {}
    K.Object.merge(setup, K.BBCodeHtml.DEFAULT_SETUP)
    K.Object.merge(setup, inSetup)
    super(setup)
    @_clearHtmlData()

  _clearHtmlData: () ->
    @htmlStack = []
    @htmlData  = {
      depth: {
        b: 0
        i: 0
        u: 0
        p: 0
        h1: 0
        h2: 0
        h3: 0
        h4: 0
        h5: 0
        h6: 0
        li: 0
        a: 0
        img: 0
      }
      liGoDeeper: 0
      skipLineBreak: 0
    }

  _htmlStack_findByHtmlIdFromTop: (htmlId) ->
    for idx in [@htmlStack.length - 1..0] by -1
      if @htmlStack[idx].htmlId == htmlId
        return idx
    return -1

  _htmlStack_applyByIdx: (state, stackIdx) ->
    htmlAction = @htmlStack[stackIdx]
    if htmlAction.type == 'openClose'
      htmlId = htmlAction.htmlId
      if htmlAction.htmlEx?
        htmlEx = htmlAction.htmlEx
      else
        htmlEx = ''
      switch htmlId
        when 'b', 'i', 'u', 'p', \
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
          state.out += '<' + htmlId + htmlEx + '>'

  _htmlStack_unapplyByIdx: (state, stackIdx) ->
    htmlAction = @htmlStack[stackIdx]
    if htmlAction.type == 'openClose'
      htmlId = htmlAction['htmlId']
      switch htmlId
        when 'b', 'i', 'u', 'p', \
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
          state.out += '</' + htmlId + '>'

        when 'li'
          state.out += '</li></ul>'

        when 'img'
          url = state.out.substr(@htmlData.img.stateOutLen)
          prefixedUrl = @setup.imgUrl + url
          state.out = state.out.substr(0, @htmlData.img.stateOutLen)
          state.out += '<img src="' + prefixedUrl + '"' + @htmlData.img.exArgs + '/>'

        when 'a'
          # if there was no text inside of link bb-code, then
          # simply emit url once again
          if @htmlData.outLenDuringATag == state.out.length
            state.out += @htmlData.urlDuringATag
          state.out += '</a>'

  _htmlStack_removeByIdx: (state, stackIdx) ->
    @_htmlStack_unapplyByIdx(state, stackIdx)
    @htmlStack.splice(stackIdx, 1)

  _htmlStack_closeById: (state, htmlId) ->
    htmlActionIdx = @_htmlStack_findByHtmlIdFromTop(htmlId)
    if htmlActionIdx >= 0
      # un-apply all items from top till the one we want to close
      for idx in [(@htmlStack.length - 1)..(htmlActionIdx + 1)] by -1
        @_htmlStack_unapplyByIdx(state, idx)

      # remove the item from the stack
      @_htmlStack_removeByIdx(state, idx)

      # reapply all items previously un-applied
      for idx in [htmlActionIdx..(@htmlStack.length - 1)] by 1
        @_htmlStack_applyByIdx(state, idx)

  _htmlStack_push: (state, htmlAction) ->
    @htmlStack.push(htmlAction)
    @_htmlStack_applyByIdx(state, @htmlStack.length - 1)

  _htmlStack_executeClose: (state, command) ->
    # execute the close of a command itself
    switch command
      when 'b', 'i', 'u', 'p', \
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', \
      'a', 'img'
        # if there is command of that type on the stack, then pop it
        if @htmlData['depth'][command] > 0
          @_htmlStack_closeById(state, command)
          @htmlData['depth'][command] = 0

      when 'li'
        if @htmlData['depth'].li > 0
          @_htmlStack_closeById(state, command)
          @htmlData['depth'].li--

      else
        @_htmlStack_closeById(state, command)

    # after some commands we force ignoring of following line-break
    switch command
      when 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', \
      'li', 'p'
        @htmlData.skipLineBreak = 1

  _htmlStack_closeAtTop: (state) ->
    topIdx = @htmlStack.length - 1
    if (topIdx >= 0)
      @_htmlStack_executeClose(state, @htmlStack[topIdx].htmlId)

  _htmlEmitAhref: (state, params) ->
    moreTxt = ''
    if (params.command is 'linkin') and (params.target == '')
      if @setup.blockOnClickOnInternalLinks
        moreTxt += ' ' + K.LinksUtil.getOnClickEventBlockerTxt()
      if @setup.passLinkDataOnInternalLinks
        moreTxt += ' ' + K.LinksUtil.getLinkAsDataParam(params.plainUrl)

    state.out += '<a href="' + params.prefixedUrl + '"' + params.target + params.htmlClass + moreTxt + '>'

  _htmlCommonHtmlArgsParse: (args) ->
    htmlEx = ''

    # get the class param, if exists
    if @_argsIsKey(args, 'class')
      htmlEx += ' class="' + @_argsGetValue(args, 'class') + '"'

    # get the id param, if exists
    if @_argsIsKey(args, 'id')
      htmlEx += ' id="' + @_argsGetValue(args, 'id') + '"'

    return htmlEx

  _parseBBCommand: (state, command, prefix) ->
    # most of the code below needs empty "args" array
    args = []

    #
    # opener - no prefix
    #
    if prefix == ''
      switch (command)
        when 'b', 'i', 'u', 'p', \
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
          @_parseBBCommandArgs(state, command, prefix, args)
          htmlEx = @_htmlCommonHtmlArgsParse(args)
          if @htmlData.depth[command] == 0
            @_htmlStack_push(state, {type:'openClose', htmlId: command, htmlEx: htmlEx})
          @htmlData.depth[command]++

        when 'li'
          @_parseBBCommandArgs(state, command, prefix, args)
          if @htmlData.depth.li == 0
            @_htmlStack_push(state, {type:'openClose', htmlId: 'li'})
            state.out += '<ul><li>'
            @htmlData.depth.li = 1
          else if @htmlData.depth.li > 0
            # if there was [ul] just recently, which goes "deeper"
            if @htmlData.liGoDeeper
              @_htmlStack_push(state, {type:'openClose', htmlId: 'li'})
              state.out += '<ul><li>'
              @htmlData.liGoDeeper = 0
              @htmlData.depth.li++
            else
              state.out += '</li><li>'

        when 'ul'
          @_parseBBCommandArgs(state, command, prefix, args)
          if @htmlData.depth.li > 0
            if @htmlData.liGoDeeper == 0
              @htmlData.liGoDeeper = 1
            else
              throw new K.BBCodeException('Cannot use html-ul after html-ul directly')

        when 'link', 'linkin'
          if @htmlData.depth.a == 0

            # parse params
            @_parseBBCommandArgs(state, command, prefix, args)
            url = @_argsGetValue(args, 'url')
            target = if @_argsIsKey(args, 'open') then ' target="_blank"' else ''
            # is the url correct

            if not url?
              state.out += '?url?'
            else
              # get the class param, if exists
              if @_argsIsKey(args, 'class')
                htmlClass = ' class="' + @_argsGetValue(args, 'class') + '"'
              else
                htmlClass = ''

              # create correct prefixed url
              if command == 'link'
                if (url.substr(0, 7) == 'http://') or (url.substr(0, 8) == 'https://')
                  prefixedUrl = url
                else
                  prefixedUrl = 'http://' + url
              else
                # the command is 'linkin'
                prefixedUrl = @setup.innerUrl + url

              # push outputs
              @_htmlStack_push(state, {type:'openClose', htmlId: 'a'})
              @_htmlEmitAhref(state, {
                command:command
                prefixedUrl:prefixedUrl
                plainUrl:url
                target:target
                htmlClass:htmlClass
              })
              @htmlData.depth.a = 1
              @htmlData.outLenDuringATag = state.out.length
              @htmlData.urlDuringATag = url

        when 'img'
          @_parseBBCommandArgs(state, command, prefix, args)
          htmlEx = @_htmlCommonHtmlArgsParse(args)

          # get the alt param, if exists
          if @_argsIsKey(args, 'alt')
            htmlEx += ' alt="' + @_argsGetValue(args, 'alt') + '"'

          # look for src param
          if @_argsIsKey(args, 'src')
            url = @_argsGetValue(args, 'src')
            prefixedUrl = @setup.imgUrl + url
            state.out += '<img src="' + prefixedUrl + '"' + htmlEx + '/>'
          else
            # src not present - look for closing tag
            if @htmlData.depth.img == 0
              @_htmlStack_push(state, {type:'openClose', htmlId: 'img'})
              @htmlData.img = {exArgs: htmlEx, stateOutLen: state.out.length}
              @htmlData.depth.img = 1

        when 'target'
          @_parseBBCommandArgs(state, command, prefix, args)
          state.out += '<a name="' + @_argsGetValue(args, 'id') + '"></a>'
          @htmlData.skipLineBreak = 1

        else
          # unhandled stuff
          super(state, command, prefix)
    #
    # closer - prefix is "/""
    #
    else if prefix == '/'
      switch (command)
        when 'b', 'i', 'u', 'p', \
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
          @_parseBBCommandArgs(state, command, prefix, args)
          @_htmlStack_executeClose(state, command)

        when 'li'
          # closing of li is simply ignored
          @_parseBBCommandArgs(state, command, prefix, args)

        when 'ul'
          @_parseBBCommandArgs(state, command, prefix, args)
          @_htmlStack_executeClose(state, 'li')

        when 'link', 'linkin'
          @_parseBBCommandArgs(state, command, prefix, args)
          @_htmlStack_executeClose(state, 'a')

        when 'img'
          @_parseBBCommandArgs(state, command, prefix, args)
          @_htmlStack_executeClose(state, 'img')

        when ''
          # anonymous close - remove one item from top of the stack
          @_parseBBCommandArgs(state, command, prefix, args)
          @_htmlStack_closeAtTop(state)
        else
          # unhandled stuff
          super(state, command, prefix)

  _parseText: (state) ->
    # prepare correct regexp according to configuration
    if @setup.allowDirectHtml
      PARSE_TEXT_TILL = new RegExp('[^\[\n\r\t]*', 'g')
    else
      PARSE_TEXT_TILL = new RegExp('[^\[\n\r\t&"\'<>]*', 'g')

    # parse everything that's considered to be text (passed through)
    PARSE_TEXT_TILL.lastIndex = state.srcIdx
    regexpResult = PARSE_TEXT_TILL.exec(state.src)
    if regexpResult? and regexpResult[0].length > 0
      state.srcIdx += regexpResult[0].length
      state.out    += regexpResult[0]
      @htmlData.skipLineBreak = 0


    # look what's next, right after "clean" text and handle it
    if state.srcIdx < state.src.length
      c = state.src.charAt(state.srcIdx)
      switch c
        when '['
          ; # do nothing
        when '\n'
          # line-breaking depends on previously parsed tags
          # (for example: no linebreak right after [h1][/])
          if @htmlData.skipLineBreak == 0
            if @setup.lbToBrEnabled
              state.out += '<br>'
          else
            @htmlData.skipLineBreak = 0
          state.srcIdx++
        when '\r'
          state.srcIdx++
        when '<'
          state.out += '&lt;'
          state.srcIdx++
        when '>'
          state.out += '&gt;'
          state.srcIdx++
        when '&'
          state.out += '&amp;'
          state.srcIdx++
        when '"'
          state.out += '&quot;'
          state.srcIdx++
        when "'"
          state.out += '&#039;'
          state.srcIdx++
        else
          state.srcIdx++


  _parseBB: (state) ->
    super(state)

    # close unclosed tags
    while @htmlStack.length > 0
      @_htmlStack_removeByIdx(state, @htmlStack.length - 1)


  parse: (src) ->
    @_clearHtmlData()
    return super(src)

exports.BBCodeHtml = K.BBCodeHtml

