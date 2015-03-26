Mocha = require('mocha')
mocha = new Mocha({ui: 'tdd', reporter: 'spec', bail: 'yes'})
mocha.addFile('test_bbCode.coffee')
mocha.run()
