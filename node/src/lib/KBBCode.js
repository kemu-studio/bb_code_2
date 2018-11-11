(function () {

// Is it server or browser?
let K = null;

if (typeof exports !== "undefined" && exports !== null)
{
  // Server - load K namespace from npm package.
  K = require('kcore');
}
else
{
  // Browser.
  K = window.K;
}

K.BBCodeException = class K_BBCodeException extends Error
{
  constructor(message, state)
  {
    super()
    this.message = message;
    this.state   = state;
    Error.captureStackTrace(this, this);
  }

  toString()
  {
    return this.message + ' at input character: ' + this.state.srcIdx;
  }
}

K.BBCode = class K_BBCode
{
  constructor(setup)
  {
    this.THROW_EXCEPTIONS = false;
    this.setup            = setup;
  }

  _argsGetValue(args, key)
  {
    let rv = null;

    for (let idx in args)
    {
      if (args[idx].key == key)
      {
        rv = args[idx].value;

        break;
      }
    }

    return rv;
  }

  _argsIsKey(args, key)
  {
    let rv = false;

    for (let idx in args)
    {
      if (args[idx].key == key)
      {
        rv = true;

        break;
      }
    }

    return rv;
  }

  _argsPack(args)
  {
    rv = {};

    for (let idx in args)
    {
      const arg = args[idx];

      rv[arg.key] = arg.value;
    }

    return rv;
  }

  _parseWhiteSpace(state)
  {
    K.BBCode.BB_TAG_WHITESPACE.lastIndex = state.srcIdx;

    const regexpResult = K.BBCode.BB_TAG_WHITESPACE.exec(state.src);

    if (K.Object.isNotNull(regexpResult))
    {
      state.srcIdx      += regexpResult[0].length;
      state.failureMark += regexpResult[0];
    }
  }

  _parseQuotations(state)
  {
    let returnString = '';

    const srcLen = state.src.length;

    // is this a legal delimeter (" or '?)
    const delim = state.src.charAt(state.srcIdx);

    if ((delim == '"') || (delim == "'"))
    {
      let closed = false;

      state.srcIdx++;
      state.failureMark += delim;

      // we got opening character, now look for closing one
      while ((state.srcIdx < srcLen) && (!closed))
      {
        // parse till delimeter found again
        const nextDelimIdx = state.src.indexOf(delim, state.srcIdx);

        if (nextDelimIdx == -1)
        {
          // can't find delimeter ? something really wrong...
          state.out += 'TODO';
          state.srcIdx = srcLen;
          throw new K.BBCodeException('Quotation never closed...', state);
        }

        // got delim, add the parsed string to output
        const parsedString = state.src.substring(state.srcIdx, nextDelimIdx);
        returnString += parsedString;
        state.srcIdx = nextDelimIdx + 1;
        state.failureMark += parsedString + delim;
        closed = true;

        // now check if it's not double delim, like "" or '', which we
        // should ignore and continue parsing
        if ((state.srcIdx < srcLen) && (state.src.charAt(state.srcIdx) == delim))
        {
          returnString      += delim;
          state.failureMark += delim;
          state.srcIdx++
          closed = false
        }
      }
    }
    else
    {
      throw new K.BBCodeException('Illegal quotation string...', state);
    }

    return returnString;
  }

  _parseBBCommandArgs(state, command, prefix, args)
  {
    // init parsing
    const srcLen = state.src.length;

    let correct   = false;
    let parseMore = true;

    // parse
    while ((state.srcIdx < srcLen) && (parseMore))
    {
      this._parseWhiteSpace(state);

      if (state.src.charAt(state.srcIdx) == ']')
      {
        state.srcIdx++;
        correct   = true;
        parseMore = false;
      }
      else
      {
        // parse one argument
        K.BBCode.BB_TAG_COMMAND_ARG_REGEXP.lastIndex = state.srcIdx;

        let regexpResult = K.BBCode.BB_TAG_COMMAND_ARG_REGEXP.exec(state.src);

        if (K.Object.isNotNull(regexpResult) && (regexpResult[0] != ''))
        {
          // we've got argKey (in ABC=XYZ, the ABC part is a key)
          let argKey   = regexpResult[0];
          let argValue = null;

          state.srcIdx      += argKey.length;
          state.failureMark += argKey;

          // look for the "=value" part
          this._parseWhiteSpace(state);

          if ((state.srcIdx < srcLen) && (state.src.charAt(state.srcIdx) == '='))
          {
            state.srcIdx++;
            state.failureMark += '=';
            this._parseWhiteSpace(state);

            if (state.srcIdx < srcLen)
            {
              // check if this is pure value (like "key=1") or something in
              // quotation (like "key='value'")
              const ch = state.src.charAt(state.srcIdx);

              if ((ch == '"') || (ch == "'"))
              {
                // got quotation - parse it
                argValue = this._parseQuotations(state);
              }
              else
              {
                // no quotations, parse pure value
                K.BBCode.BB_TAG_COMMAND_ARG_REGEXP.lastIndex = state.srcIdx;

                const regexpResult = K.BBCode.BB_TAG_COMMAND_ARG_REGEXP.exec(state.src);

                if (K.Object.isNotNull(regexpResult) && (regexpResult[0] != ''))
                {
                  argValue = regexpResult[0];
                  state.srcIdx += argValue.length;
                }
                else
                {
                  state.srcIdx++;
                  // argValue statys as null
                }
              }
            }
          }

          // put parsed key/value to result table
          args.push({key: argKey, value: argValue});
        }
        else
        {
          correct = false;
          throw new K.BBCodeException('Incorrect BB-command args', state);
        }
      }
    }

    // the BB-command was never closed?
    if ((state.srcIdx == srcLen) && parseMore)
    {
      throw new K.BBCodeException('Tag never closed', state);
    }
  }

  // this method should be overriden by some real BBCode implementations
  _parseBBCommand(state, command, prefix)
  {
    switch (command)
    {
      case '0':
      {
        this._parseBBCommandArgs(state, command, prefix, []);

        const closeIdx = state.src.indexOf('[1', state.srcIdx);

        if (closeIdx != -1)
        {
          // Close [1] tag found - go to it.
          state.srcIdx = closeIdx;
        }
        else
        {
          // Close [1] tag missing - go to the end of input.
          state.srcIdx = state.src.length;
        }

        break;
      }

      case '1':
      {
        this._parseBBCommandArgs(state, command, prefix, []);

        // Skip line-break just after [1] tag.

        if (state.src[state.srcIdx] == '\n')
        {
          state.srcIdx++;
        }

        break;
      }

      default:
      {
        state.out += '[' + prefix + command;
        state.failureMark = '';
      }
    }

    return state;
  }

  _parseBBTag(state)
  {
    // check if we are "legally here"
    if (state.src.charAt(state.srcIdx) == '[')
    {
      state.srcIdx++;
      state.failureMark += '[';

      // check if this is real tag, or just "[[" - a BB ignore
      if ((state.srcIdx < state.src.length) && (state.src.charAt(state.srcIdx) == '['))
      {
        // this is "[[", parse it as "[" and exit
        state.srcIdx++;
        state.out += '[';
      }
      else
      {
        // It looks like proper BB-tag
        // Check for any prefix (like "\" or "!")

        let srcChar = state.src.charAt(state.srcIdx);
        let prefix  = '';

        if (K.BBCode.BB_TAG_PREFIXES.indexOf(srcChar) != -1)
        {
          prefix = srcChar;
          state.failureMark += srcChar;
          state.srcIdx++;
          srcChar = state.src.charAt(state.srcIdx);
        }

        // take command from BB-tag and try calling it
        K.BBCode.BB_TAG_COMMAND_REGEXP.lastIndex = state.srcIdx;

        const regexpResult = K.BBCode.BB_TAG_COMMAND_REGEXP.exec(state.src);

        let command = null;

        if (K.Object.isNotNull(regexpResult) && (regexpResult[0] != ''))
        {
          command = regexpResult[0];
        }

        if (K.Object.isNotNull(command) && (command.length > 0))
        {
          state.srcIdx      += command.length;
          state.failureMark += command;
          state = this._parseBBCommand(state, command, prefix);
        }
        else
        {
          if (prefix != '')
          {
            // empty command, but prefix is there...
            state = this._parseBBCommand(state, '', prefix);
          }
          else
          {
            // not a legal tag
            state.out += '[' + prefix;
          }
        }
      }
    }
    else
    {
      throw new K.BBCodeException('not really a BB tag - something is wrong...', state);
    }
  }

  _parseText(state)
  {
    const step = state.src.indexOf('[', state.srcIdx);

    if (step == -1)
    {
      state.out += state.src.substr(state.srcIdx);
      state.srcIdx = state.src.length;
    }
    else
    {
      state.out += state.src.substring(state.srcIdx, step);
      state.srcIdx = step;
    }
  }

  _parseBB(state)
  {
    // parse
    while (state.srcIdx < state.src.length)
    {
      const ch = state.src.charAt(state.srcIdx);

      if (ch == '[')
      {
        this._parseBBTag(state);

        state.failureMark = '';
      }
      else
      {
        this._parseText(state);
      }
    }
  }

  parse(src)
  {
    const theState = {
      src:    src,
      srcIdx: 0,
      out:    '',
      failureMark: '' // a copy of currently parsed tag, up to the point it failed
    };

    if (this.THROW_EXCEPTIONS)
    {
      this._parseBB(theState);
    }
    else
    {
      try
      {
        this._parseBB(theState);
      }
      catch (error)
      {
        ; // nothing to do here
      }
    }

    return theState.out + theState.failureMark;
  }
}

// Class constants.
K.BBCode.BB_TAG_WHITESPACE = new RegExp('[ \n\r\t]*', 'g');
K.BBCode.BB_TAG_PREFIXES = '\\!-+/';
K.BBCode.BB_TAG_COMMAND_REGEXP = new RegExp('[A-Za-z0-9_]*', 'g');
K.BBCode.BB_TAG_COMMAND_ARG_REGEXP = new RegExp('[A-Za-z0-9_]*', 'g');

exports.BBCode = K.BBCode;

})(this);
