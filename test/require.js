var vm = require('vm');
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var js = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8');

describe('require', function() {
  it('should contain component\'s require', function () {
    var ctx = vm.createContext();
    vm.runInContext(js, ctx);
    var componentRequire = vm.runInContext('require', ctx);
    assert.equal(componentRequire.loader, 'component');
    componentRequire.modules['component~dom@1.0.0'] = {exports: '1.0.0'};
    var resolved = componentRequire('component~dom@1.0.0');
    assert.equal(resolved, '1.0.0');
  })

  it('should have a sorting helper for semantic versioning', function () {
    var ctx = vm.createContext();
    vm.runInContext(js, ctx);
    var sortingFn = vm.runInContext('require.helper.semVerSort', ctx);
    var test = [
      '2.0.0',
      '0.0.0',
      '1.0.11',
      '1.1.0',
      '1.0.0-beta',
      '1.0.2',
      '1.0.0',
      '1.2.1'
    ];
    var expected = [
      '0.0.0',
      '1.0.0',
      '1.0.0-beta',
      '1.0.2',
      '1.0.11',
      '1.1.0',
      '1.2.1',
      '2.0.0'
    ];
    test = test.map(function(i){return {name: i, version: i}});
    expected = expected.map(function(i){return {name: i, version: i}})
    var result = test.sort(sortingFn);
    assert.deepEqual(result, expected);
  })

  it('should return latest semantic version of a module', function () {
    var ctx = vm.createContext();
    vm.runInContext(js, ctx);
    var componentRequire = vm.runInContext('require', ctx);
    componentRequire.modules['component~dom@1.0.2'] = {exports: '1.0.2'};
    componentRequire.modules['component~dom@1.0.11'] = {exports: '1.0.11'};
    componentRequire.modules['component~dom@1.0.0'] = {exports: '1.0.0'};
    componentRequire.modules['component~dom@master'] = {exports: 'master'};
    componentRequire.modules['component'] = {exports: 'a local component'};
    componentRequire.modules['dom'] = {exports: 'another local'};
    assert.throws(function() {componentRequire.latest('component')});
    assert.throws(function() {componentRequire.latest('dom')});
    var resolved = componentRequire.latest('component~dom');
    assert.equal(resolved, '1.0.11');
    })

  it('should return a branch version of a module if no semvers were found', function () {
    var ctx = vm.createContext();
    vm.runInContext(js, ctx);
    var componentRequire = vm.runInContext('require', ctx);
    componentRequire.modules['component~dom@master'] = {exports: 'master'};
    var resolved = componentRequire.latest('component~dom');
    assert.equal(resolved, 'master');
  })
})