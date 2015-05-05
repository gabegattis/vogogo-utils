'use strict';

var should = require('chai').should();
var sinon = require('sinon');
var Vogogo = require('../lib/vogogo');
var request = require('request');
var config = require('../config');

describe('Vogogo', function() {
  config = {
    authParams: {
      clientId: 'asdf',
      clientSecret: 'qwerty',
      customerAccessToken: 'asdf'
    },
    environments: {
      staging: {
        apiPrefix: 'https://staging.api.vogogo.com/v2'
      },
      production: {
        apiPrefix: 'https://api.vogogo.com/v2'
      }
    }
  };

  var constructorOptions = config.authParams;

  describe('constructor', function() {
    it('should create new Vogogo without apiPrefix', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        customerAccessToken: 'zxcvb'
      };

      var vogogo = new Vogogo(options);

      vogogo.should.be.an.instanceOf(Vogogo);
      vogogo.clientId.should.equal('asdf');
      vogogo.clientSecret.should.equal('qwert');
      vogogo.customerAccessToken.should.equal('zxcvb');
      vogogo.apiPrefix.should.equal(config.environments.production.apiPrefix);
      done();
    });

    it('should create new Vogogo with apiPrefix', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        customerAccessToken: 'zxcvb',
        apiPrefix: 'https://fakevogogo.com/api/v9000'
      };

      var vogogo = new Vogogo(options);

      vogogo.should.be.an.instanceOf(Vogogo);
      vogogo.clientId.should.equal('asdf');
      vogogo.clientSecret.should.equal('qwert');
      vogogo.customerAccessToken.should.equal('zxcvb');
      vogogo.apiPrefix.should.equal('https://fakevogogo.com/api/v9000');
      done();
    });

    it('should fail if clientId is not a string', function(done) {
      var options = {
        clientId: 10,
        clientSecret: 'qwert',
        customerAccessToken: 'zxcvb',
        apiPrefix: 'https://fakevogogo.com/api/v9000'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /clientId must be a string/);

      done();
    });

    it('should fail if clientSecret is not a string', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 10,
        customerAccessToken: 'zxcvb',
        apiPrefix: 'https://fakevogogo.com/api/v9000'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /clientSecret must be a string/);

      done();
    });

    it('should fail if customerAccessToken is not a string', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        customerAccessToken: 10,
        apiPrefix: 'https://fakevogogo.com/api/v9000'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /customerAccessToken must be a string/);

      done();
    });

    it('should fail if apiPrefix is not a string', function(done) {
      var options = {
        clientId: 'adsf',
        clientSecret: 'qwert',
        customerAccessToken: 'zxcvb',
        apiPrefix: 10
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /apiPrefix must be a string/);

      done();
    });

    it('should fail with no clientId', function(done) {
      var options = {
        clientSecret: 'qwert',
        customerAccessToken: 'zxcvb',
      };

      var message = /you must supply a clientId in the constructor options/;
      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, message);

      done();
    });

    it('should fail with no clientSecret', function(done) {
      var options = {
        clientId: 'adsf',
        customerAccessToken: 'zxcvb',
      };

      var message = /you must supply a clientSecret in the constructor options/;
      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, message);

      done();
    });

    it('should fail with no customerAccessToken', function(done) {
      var options = {
        clientId: 'adsf',
        clientSecret: 'qwert'
      };

      var message = /you must supply a customerAccessToken in the constructor options/;
      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, message);

      done();
    });
  });

  describe('pay', function() {
    var goodParams = {
      id : '1234',
      account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
      amount: '155.00',
      currency: 'CAD',
      ip: '127.0.0.1'
    };

    it('should handle _post error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      vogogo.pay(goodParams, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/pay');
        _p.args[0][1].should.equal(goodParams);
        sandbox.restore();
        done();
      });
    });

    it('should handle code 403', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 403});
      });

      vogogo.pay(goodParams, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('403 FORBIDDEN');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/pay');
        _p.args[0][1].should.equal(goodParams);
        sandbox.restore();
        done();
      });
    });

    it('should handle code 409', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 409});
      });

      vogogo.pay(goodParams, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('409 CONFLICT');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/pay');
        _p.args[0][1].should.equal(goodParams);
        sandbox.restore();
        done();
      });
    });

    it('should handle code 418', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 418}, 'I am a teapot');
      });

      vogogo.pay(goodParams, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 418');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/pay');
        _p.args[0][1].should.equal(goodParams);
        sandbox.restore();
        done();
      });
    });

    it('should make a payment, code 200', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 200});
      });

      vogogo.pay(goodParams, function(err) {
        should.not.exist(err);
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/pay');
        _p.args[0][1].should.equal(goodParams);
        sandbox.restore();
        done();
      });
    });

    it('should make a payment, code 201', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      vogogo.pay(goodParams, function(err) {
        should.not.exist(err);
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/pay');
        _p.args[0][1].should.equal(goodParams);
        sandbox.restore();
        done();
      });
    });

    it('should error if no id', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /id is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if no account_id', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /account_id is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if no amount', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',        
        currency: 'CAD',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /amount is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if no currency', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /currency is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if no ip', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /ip is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if id is not a string', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : 1234,
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /id must be a string/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if account_id is not a string', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 78789878789898789,
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /account_id must be a string/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if currency is not a string', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 019283746,
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /currency must be a string/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if ip is not a string', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: 127001
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /ip must be a string/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if ip is too long', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '123456789012345678901234567890123'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /ip must be 32 characters or less/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if id is too long', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234567890123456789012345678901234567',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /id must be 36 characters or less/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if currency is invalid', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'XYZ',
        ip: '127.0.0.1'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /XYZ is not a supported currency/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });
  });

  describe('getTransaction', function() {
    it('should error with no id', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {};
      (function(){
        vogogo.getTransaction(params, function(){});
      }).should.throw(Error, /id is a required param/);

      _g.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with non-string id', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {
        id: 9999
      };

      (function(){
        vogogo.getTransaction(params, function(){});
      }).should.throw(Error, /id must be a string/);

      _g.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should handle _get error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {
        id: '12345'
      };
      vogogo.getTransaction(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/transactions/12345');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should handle non-200 code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 418}, 'I am a teapot');
      });
      var params = {id: '12345'};
      vogogo.getTransaction(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('non-200 status code: 418');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/transactions/12345');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should make a payment', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, {hello: 'world'});
      });
      var params = {id: '12345'};
      vogogo.getTransaction(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({hello: 'world'});
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/transactions/12345');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });
  });

  describe('listTransactions', function() {
    it('should handle _get error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {};
      vogogo.listTransactions(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/transactions');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should handle non-200 code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 418}, 'I am a teapot');
      });
      var params = {};
      vogogo.listTransactions(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('non-200 status code: 418');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/transactions');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should list transactions', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, {transactions: ['hello', 'transaction']});
      });
      var params = {};
      vogogo.listTransactions(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({
          transactions: ['hello', 'transaction']
        });
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/transactions');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });
  });

  describe('_generateAuthToken', function() {
    it ('should generate the auth token', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var authToken = vogogo._generateAuthToken();
      authToken.should.equal('Basic cXdlcnR5OmFzZGY=');
      done();
    });
  });

  describe('_post', function() {
    it('should make a POST with the right url, params, and authentication', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var po = sandbox.stub(request, 'post', function(options, callback) {
        callback(null, {statusCode: 200}, {foo: 'bar'});
      });

      var ge = sandbox.stub(vogogo, '_generateAuthToken', function() {
        return 'Basic 12345678';
      });

      vogogo._post('/pay', {herp: 'derp'}, function(err, res, body) {
        should.not.exist(err);
        should.exist(res);
        should.exist(body);
        res.should.deep.equal({statusCode: 200});
        body.should.deep.equal({foo: 'bar'});
        ge.callCount.should.equal(1);
        po.callCount.should.equal(1);
        po.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v2/pay',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {herp: 'derp'}
        });
        sandbox.restore();
        done();
      });
    });

    it('should handle request error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var po = sandbox.stub(request, 'post', function(options, callback) {
        callback(new Error('this is an error'));
      });

      var ge = sandbox.stub(vogogo, '_generateAuthToken', function() {
        return 'Basic 12345678';
      });

      vogogo._post('/pay', {herp: 'derp'}, function(err, res, body) {
        should.exist(err);
        should.not.exist(res);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        ge.callCount.should.equal(1);
        po.callCount.should.equal(1);
        po.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v2/pay',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {herp: 'derp'}
        });
        sandbox.restore();
        done();
      });
    });
  });

  describe('_get', function() {
    it('should make a get with the right url, params, and authentication', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var ge = sandbox.stub(request, 'get', function(options, callback) {
        callback(null, {statusCode: 200}, {foo: 'bar'});
      });

      var ga = sandbox.stub(vogogo, '_generateAuthToken', function() {
        return 'Basic 12345678';
      });

      vogogo._get('/transactions', {herp: 'derp'}, function(err, res, body) {
        should.not.exist(err);
        should.exist(res);
        should.exist(body);
        res.should.deep.equal({statusCode: 200});
        body.should.deep.equal({foo: 'bar'});
        ga.callCount.should.equal(1);
        ge.callCount.should.equal(1);
        ge.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v2/transactions',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          }
        });
        sandbox.restore();
        done();
      });
    });

    it('should handle request error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var ge = sandbox.stub(request, 'get', function(options, callback) {
        callback(new Error('this is an error'));
      });

      var ga = sandbox.stub(vogogo, '_generateAuthToken', function() {
        return 'Basic 12345678';
      });

      vogogo._get('/transactions', {}, function(err, res, body) {
        should.exist(err);
        should.not.exist(res);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        ga.callCount.should.equal(1);
        ge.callCount.should.equal(1);
        ge.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v2/transactions',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          }
        });
        sandbox.restore();
        done();
      });
    });
  });
});
