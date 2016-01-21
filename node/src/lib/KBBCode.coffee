if __pathToKCore?
  K = require(__pathToKCore)
else
  K = {}

class K.BBCodeException extends Error
  constructor: (@message, @state) ->
    Error.captureStackTrace(@,@)

  toString: () ->
    return @message + ' at input character: ' + @state.srcIdx

class K.BBCode
  BB_TAG_WHITESPACE = new RegExp('[ \n\r\t]*', 'g')
  BB_TAG_PREFIXES = '\\!-+/'
  BB_TAG_COMMAND_REGEXP = new RegExp('[A-Za-z0-9_]*', 'g')
  BB_TAG_COMMAND_ARG_REGEXP = new RegExp('[A-Za-z0-9_]*', 'g')

  constructor: (@setup) ->
    @THROW_EXCEPTIONS = false

  _argsGetValue: (args, key) ->
    rv = null
    for arg in args
      if arg.key == key
        rv = arg.value
        break
    return rv

  _argsIsKey: (args, key) ->
    rv = false
    for arg in args
      if arg.key == key
        rv = true
        break
    return rv

  _argsPack: (args) ->
    rv = {}
    for arg in args
      rv[arg.key] = arg.value
    return rv

  _parseWhiteSpace: (state) ->
    BB_TAG_WHITESPACE.lastIndex = state.srcIdx
    regexpResult = BB_TAG_WHITESPACE.exec(state.src)
    if regexpResult?
      state.srcIdx += regexpResult[0].length
      state.failureMark += regexpResult[0]

  _parseQuotations: (state) ->
    returnString = ''
    srcLen = state.src.length

    # is this a legal delimeter (" or '?)
    delim = state.src.charAt(state.srcIdx)
    if (delim == '"') or (delim == "'")
      closed = false
      state.srcIdx++
      state.failureMark += delim

      # we got opening character, now look for closing one
      while (state.srcIdx < srcLen) and (not closed)
        # parse till delimeter found again
        nextDelimIdx = state.src.indexOf(delim, state.srcIdx)
        if nextDelimIdx == -1
          # can't find delimeter ? something really wrong...
          state.out += 'TODO'
          state.srcIdx = srcLen
          throw new K.BBCodeException('Quotation never closed...', state)

        # got delim, add the parsed string to output
        parsedString = state.src.substring(state.srcIdx, nextDelimIdx)
        returnString += parsedString
        state.srcIdx = nextDelimIdx + 1
        state.failureMark += parsedString + delim
        closed = true

        # now check if it's not double delim, like "" or '', which we should ignore and continue parsing
        if (state.srcIdx < srcLen) and (state.src.charAt(state.srcIdx) == delim)
          returnString += delim
          state.failureMark += delim
          state.srcIdx++
          closed = false
    else
      throw new K.BBCodeException('Illegal quotation string...', state)

    return returnString

  _parseBBCommandArgs: (state, command, prefix, args) ->
    # init parsing
    srcLen = state.src.length
    correct = false
    parseMore = true

    # parse
    while (state.srcIdx < srcLen) and (parseMore)
      @_parseWhiteSpace(state)
      if state.src.charAt(state.srcIdx) == ']'
        state.srcIdx++
        correct = true
        parseMore = false
      else
        # parse one argument
        BB_TAG_COMMAND_ARG_REGEXP.lastIndex = state.srcIdx
        regexpResult = BB_TAG_COMMAND_ARG_REGEXP.exec(state.src)
        if regexpResult? and (regexpResult[0] isnt '')
          # we've got argKey (in ABC=XYZ, the ABC part is a key)
          argKey = regexpResult[0]
          argValue = null
          state.srcIdx += argKey.length
          state.failureMark += argKey

          # look for the "=value" part
          @_parseWhiteSpace(state)
          if (state.srcIdx < srcLen) and (state.src.charAt(state.srcIdx) is '=')
            state.srcIdx++
            state.failureMark += '='
            @_parseWhiteSpace(state)
            if (state.srcIdx < srcLen)
              # check if this is pure value (like "key=1") or something in quotation (like "key='value'")
              ch = state.src.charAt(state.srcIdx)
              if ch in ['"', "'"]
                # got quotation - parse it
                argValue = @_parseQuotations(state)
              else
                # no quotations, parse pure value
                BB_TAG_COMMAND_ARG_REGEXP.lastIndex = state.srcIdx
                regexpResult = BB_TAG_COMMAND_ARG_REGEXP.exec(state.src)
                if regexpResult? and (regexpResult[0] isnt '')
                  argValue = regexpResult[0]
                  state.srcIdx += argValue.length
                else
                  state.srcIdx++
                  # argValue statys as null

          # put parsed key/value to result table
          args.push({key:argKey, value:argValue})
        else
          correct = false
          throw new K.BBCodeException('Incorrect BB-command args', state)

    # the BB-command was never closed?
    if (state.srcIdx == srcLen) and parseMore
      throw new K.BBCodeException('Tag never closed', state)

  # this method should be overriden by some real BBCode implementations
  _parseBBCommand: (state, command, prefix) ->
    switch (command)
      when '0'
        @_parseBBCommandArgs(state, command, prefix, [])
        closeIdx = state.src.indexOf('[1', state.srcIdx)
        if closeIdx != -1
          state.srcIdx = closeIdx + 2
          @_parseBBCommandArgs(state, command, prefix, [])
        else
          state.srcIdx = state.src.length
      when '1'
        @_parseBBCommandArgs(state, command, prefix, [])
      else
        state.out += '[' + prefix + command
        state.failureMark = ''

    return state

  _parseBBTag: (state) ->
    # check if we are "legally here"
    if state.src.charAt(state.srcIdx) == '['
      state.srcIdx++
      state.failureMark += '['

      # check if this is real tag, or just "[[" - a BB ignore
      if (state.srcIdx < state.src.length) and (state.src.charAt(state.srcIdx) == '[')
        # this is "[[", parse it as "[" and exit
        state.srcIdx++
        state.out += '['
      else
        # It looks like proper BB-tag

        # Check for any prefix (like "\" or "!")
        srcChar = state.src.charAt(state.srcIdx)
        if BB_TAG_PREFIXES.indexOf(srcChar) != -1
          prefix = srcChar
          state.failureMark += srcChar
          state.srcIdx++
          srcChar = state.src.charAt(state.srcIdx)
        else
          prefix = ''

        # take command from BB-tag and try calling it
        BB_TAG_COMMAND_REGEXP.lastIndex = state.srcIdx
        regexpResult = BB_TAG_COMMAND_REGEXP.exec(state.src)
        if regexpResult? and (regexpResult[0] isnt '')
          command = regexpResult[0]
        else
          command = null
        if command? and command.length > 0
          state.srcIdx += command.length
          state.failureMark += command
          state = @_parseBBCommand(state, command, prefix)
        else
          if prefix != ''
            # empty command, but prefix is there...
            state = @_parseBBCommand(state, '', prefix)
          else
            # not a legal tag
            state.out += '[' + prefix
    else
      throw new K.BBCodeException('not really a BB tag - something is wrong...', state)

  _parseText: (state) ->
    step = state.src.indexOf('[', state.srcIdx)
    if step == -1
      state.out += state.src.substr(state.srcIdx)
      state.srcIdx = state.src.length
    else
      state.out += state.src.substring(state.srcIdx, step)
      state.srcIdx = step

  _parseBB: (state) ->
    # parse
    while state.srcIdx < state.src.length
      ch = state.src.charAt(state.srcIdx)
      if ch == '['
        @_parseBBTag(state)
        state.failureMark = ''
      else
        @_parseText(state)

  parse: (src) ->
    theState =
      src:    src
      srcIdx: 0
      out:    ''
      failureMark: '' # a copy of currently parsed tag, up to the point it failed

    if @THROW_EXCEPTIONS
      @_parseBB(theState)
    else
      try
        @_parseBB(theState)
      catch error
        ; # nothing to do here

    return theState.out + theState.failureMark


exports.BBCode = K.BBCode
