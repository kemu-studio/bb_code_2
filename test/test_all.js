const Mocha = require('mocha');
mocha = new Mocha({ui: 'tdd', reporter: 'spec', bail: 'yes'});
mocha.addFile(__dirname + '\\test_bbCode.js');
mocha.run();
