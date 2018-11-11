require('coffeescript/register');

const Mocha = require('mocha');
mocha = new Mocha({ui: 'tdd', reporter: 'spec', bail: 'yes'});
mocha.addFile('test_bbCode.js');
mocha.run();
