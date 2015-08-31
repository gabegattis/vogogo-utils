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
        apiPrefix: 'https://staging.api.vogogo.com/v3'
      },
      production: {
        apiPrefix: 'https://api.vogogo.com/v3'
      }
    }
  };

  var constructorOptions = {
    clientId: '555c3c5ede4b81f9e1d7f22f273b23ae745023d7d208d2da48a36312e5a83dab',
    clientSecret: 'fb397fdf8d28ea72ec6901fe186eb74a6de28125ae026a14fade58eabafd9b50',
    apiPrefix: 'https://api.vogogo.com/v3',
    ipAddress: '127.0.0.1',
    deviceId: 'blahblahblah'
  };

  describe('constructor', function() {
    it('should create new Vogogo with all options', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      var vogogo = new Vogogo(options);

      vogogo.should.be.an.instanceOf(Vogogo);
      vogogo.clientId.should.equal('asdf');
      vogogo.clientSecret.should.equal('qwert');
      vogogo.apiPrefix.should.equal('https://fakevogogo.com/api/v9000');
      vogogo.ipAddress.should.equal('127.0.0.1');
      vogogo.deviceId.should.equal('blahblahblah');
      done();
    });

    it('should not create new Vogogo without clientId', function(done) {
      var options = {
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error);

      done();
    });

    it('should not create new Vogogo without clientSecret', function(done) {
      var options = {
        clientId: 'asdf',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error);

      done();
    });

    it('should not create new Vogogo without apiPrefix', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error);

      done();
    });

    it('should not create new Vogogo without ipAddress', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error);

      done();
    });

    it('should not create new Vogogo without deviceId', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error);

      done();
    });






    it('should fail if clientId is not a string', function(done) {
      var options = {
        clientId: {},
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /clientId must be a string/);

      done();
    });

    it('should fail if clientSecret is not a string', function(done) {
      var options = {
        clientId: 'asdf',
        clientSecret: {},
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /clientSecret must be a string/);

      done();
    });

    it('should fail if apiPrefix is not a string', function(done) {
      var options = {
        clientId: 'adsf',
        clientSecret: 'qwert',
        apiPrefix: {},
        ipAddress: '127.0.0.1',
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /apiPrefix must be a string/);

      done();
    });

    it('should fail if ipAddress is not a string', function(done) {
      var options = {
        clientId: 'adsf',
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: {},
        deviceId: 'blahblahblah'
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /ipAddress must be a string/);

      done();
    });

    it('should fail if deviceId is not a string', function(done) {
      var options = {
        clientId: 'adsf',
        clientSecret: 'qwert',
        apiPrefix: 'https://fakevogogo.com/api/v9000',
        ipAddress: '127.0.0.1',
        deviceId: {}
      };

      (function(){var vogogo = new Vogogo(options);}).should.throw(Error, /deviceId must be a string/);

      done();
    });


  });

  describe('pay', function() {
    it('should handle _post error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      var params = {
        merchant_transaction_id : '1234',
        type: 'pay',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf'
      };

      vogogo.pay(params, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank');
        delete params.customerAccessToken;
        _p.args[0][1].should.equal(params);
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

      var params = {
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      vogogo.pay(params, function(err) {
        should.not.exist(err);
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank');
        delete params.customerAccessToken;
        _p.args[0][1].should.equal(params);
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

      var params = {
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      vogogo.pay(params, function(err) {
        should.not.exist(err);
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank');
        delete params.customerAccessToken;
        _p.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should error if no merchant_transaction_id', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        type: 'pay',
        customerId: 'asdf'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /merchant_transaction_id is a required parameter/);

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
        merchant_transaction_id : '1234',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
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
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
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
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /currency is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if merchant_transaction_id is not a string', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : 1234,
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
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
        merchant_transaction_id : '1234',
        account_id: 78789878789898789,
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /account_id must be a string/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if amount is not a number', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: '78789878789898789',
        amount: 'hello',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /invalid amount/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if amount is negative', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: '78789878789898789',
        amount: -1,
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /invalid amount/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if amount is 0', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: '78789878789898789',
        amount: 0,
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /invalid amount/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if amount is infinity', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: '78789878789898789',
        amount: Infinity,
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /invalid amount/);

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
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 019283746,
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /currency must be a string/);

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
        merchant_transaction_id : '1234567890123456789012345678901234567',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
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
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'XYZ',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /XYZ is not a supported currency/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if no customerId', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'XYZ',
        ip: '127.0.0.1',
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /customerId is a required parameter/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error if invalid customerId', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'XYZ',
        ip: '127.0.0.1',
        customerId: 123,
        type: 'pay'
      };

      (function(){
        vogogo.pay(params, function(){});
      }).should.throw(Error, /customerId must be a string/);

      _p.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should handle bad response code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 400}, {error_message: 'uh-oh spaghettio'});
      });

      var params = {
        merchant_transaction_id : '1234',
        account_id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
        amount: '155.00',
        currency: 'CAD',
        ip: '127.0.0.1',
        customerId: 'asdf',
        type: 'pay'
      };

      vogogo.pay(params, function(err, body){
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 400 - uh-oh spaghettio');
        _p.callCount.should.equal(1);
        sandbox.restore();
        done();
      });
    });
  });

  describe('getTransaction', function() {
    it('should error with no customerId', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {txid: 'qwertyuiop'};
      (function(){
        vogogo.getTransaction(params, function(){});
      }).should.throw(Error, /customerId is a required param/);

      _g.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with non-string customerId', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {
        customerId: 9999,
        txid: 'qwertyuiop'
      };

      (function(){
        vogogo.getTransaction(params, function(){});
      }).should.throw(Error, /customerId must be a string/);

      _g.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with no txid', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {customerId: 'asdf'};
      (function(){
        vogogo.getTransaction(params, function(){});
      }).should.throw(Error, /txid is a required param/);

      _g.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with non-string txid', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {
        customerId: 'asdf',
        txid: 12345
      };

      (function(){
        vogogo.getTransaction(params, function(){});
      }).should.throw(Error, /txid must be a string/);

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
        customerId: 'asdf',
        txid: 'qwertyuiop'
      };

      vogogo.getTransaction(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions/qwertyuiop');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should handle non-200 code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 418}, {error_message: 'this is an error'});
      });
      var params = {
        customerId: 'asdf',
        txid: 'qwertyuiop'
      };

      vogogo.getTransaction(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 418 - this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions/qwertyuiop');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should get a transaction', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, {hello: 'world'});
      });
      var params = {
        customerId: 'asdf',
        txid: 'qwertyuiop'
      };
      vogogo.getTransaction(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({hello: 'world'});
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions/qwertyuiop');
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
      var params = {
        customerId: 'asdf'
      };
      vogogo.listTransactions(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should handle non-200 code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 418}, {error_message: 'this is an error'});
      });
      var params = {
        customerId: 'asdf'
      };
      vogogo.listTransactions(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 418 - this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should error with invalid currency', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 418}, {error_message: 'this is an error'});
      });
      var params = {
        currency: 'XYZ',
        customerIdn: 'asdf'
      };

      (function() {
        vogogo.listTransactions(params, function(){});
      }).should.throw(Error, /XYZ is not a supported currency/);

      _g.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should list transactions', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, {foo: 'bar'});
      });
      var params = {
        customerId: 'asdf'
      };
      vogogo.listTransactions(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({foo: 'bar'});
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should list transactions by currency', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, {foo: 'bar'});
      });
      var params = {
        customerId: 'asdf',
        currency: 'CAD'
      };
      vogogo.listTransactions(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({foo: 'bar'});
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/transactions');
        _g.args[0][1].should.deep.equal({currency: 'CAD'});
        sandbox.restore();
        done();
      });
    });
  });

  describe('addBankAccount', function() {
    it('should handle _post error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(new Error('this is an error'));
      });
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      vogogo.addBankAccount(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _p.args[0][1].should.deep.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should handle non-200 code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 418}, {error_message: 'this is an error'});
      });
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      vogogo.addBankAccount(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 418 - this is an error');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _p.args[0][1].should.deep.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should add account 200', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 200}, {bank: 'account'});
      });
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      vogogo.addBankAccount(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({
          bank: 'account'
        });
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _p.args[0][1].should.deep.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should add account 201', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201}, {bank: 'account'});
      });
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      vogogo.addBankAccount(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({
          bank: 'account'
        });
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _p.args[0][1].should.deep.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should error with no name', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /name is a required parameter/);
      done();
    });

    it('should error with name too long', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: '123456789012345678901234567890123456789012345678901',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid name/);
      done();
    });

    it('should error with number name', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 10,
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid name/);
      done();
    });

    it('should error with no number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /number is a required parameter/);
      done();
    });

    it('should error with no currency', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /currency is a required parameter/);
      done();
    });

    it('should error with invalid currency', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'xyz',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid currency/);
      done();
    });

    it('should error with no financial_type', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /financial_type is a required parameter/);
      done();
    });

    it('should error with invalid financial_type', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'slush fund',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid financial_type/);
      done();
    });

    it('should error with no customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'savings',
        routing: '123456789',
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /customerId is a required parameter/);
      done();
    });

    it('should error with invalid customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'savings',
        routing: '123456789',
        customerId: {}
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /customerId must be a string/);
      done();
    });

    it('should error with no routing', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /routing is a required parameter for USD accounts/);
      done();
    });

    it('should error with obj routing', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: {},
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid routing/);
      done();
    });

    it('should error with to short routing', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '12345678',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid routing/);
      done();
    });

    it('should error with too long routing', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890',
        currency: 'USD',
        financial_type: 'checking',
        routing: '1234567890',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid routing/);
      done();
    });

    it('should error with obj number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: {},
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid number/);
      done();
    });

    it('should error with too short number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '12345',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid number/);
      done();
    });

    it('should error with too long number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345678',
        currency: 'USD',
        financial_type: 'checking',
        routing: '123456789',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid number/);
      done();
    });

    it('should error with no institution', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /institution is a required parameter for CAD accounts/);
      done();
    });

    it('should error with obj institution', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: {},
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid institution/);
      done();
    });

    it('should error with too short institution', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '12',
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid institution/);
      done();
    });

    it('should error with too long institution', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '1234',
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid institution/);
      done();
    });

    it('should error with no transit', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /transit is a required parameter for CAD accounts/);
      done();
    });

    it('should error with obj transit', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        transit: {},
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid transit/);
      done();
    });

    it('should error with too long transit', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        transit: '123456',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid transit/);
      done();
    });

    it('should error with too short transit', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456789012345',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        transit: '1234',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid transit/);
      done();
    });

    it('should error with obj number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: {},
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid number/);
      done();
    });

    it('should error with too short number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '123456',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid number/);
      done();
    });

    it('should error with too long number', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var params = {
        name: 'a',
        number: '1234567890123456',
        currency: 'CAD',
        financial_type: 'checking',
        institution: '123',
        transit: '12345',
        customerId: 'asdf'
      };
      (function(){
        vogogo.addBankAccount(params, function(){});
      }).should.throw(Error, /invalid number/);
      done();
    });
  });

  describe('removeBankAccount', function() {
    it('should error with no customerId', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback();
      });

      var params = {
        bankAccountId: 'derp'
      };

      (function(){
        vogogo.removeBankAccount(params, function(){});
      }).should.throw(Error, /customerId is a required parameter/);

      _d.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with bad customerId', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback();
      });

      var params = {
        customerId: 12345,
        bankAccountId: 'derp'
      };

      (function(){
        vogogo.removeBankAccount(params, function(){});
      }).should.throw(Error, /customerId must be a string/);

      _d.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with no bankAccountId', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback();
      });

      var params = {
        customerId: 'asdf',
      };


      (function(){
        vogogo.removeBankAccount(params, function(){});
      }).should.throw(Error, /bankAccountId is a required parameter/);

      _d.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should error with bad bankAccountId', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback();
      });

      var params = {
        customerId: 'asdf',
        bankAccountId: 12345
      };

      (function(){
        vogogo.removeBankAccount(params, function(){});
      }).should.throw(Error, /bankAccountId must be a string/);

      _d.callCount.should.equal(0);
      sandbox.restore();
      done();
    });

    it('should handle _delete error', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      var params = {
        customerId: 'asdf',
        bankAccountId: 'derp'
      };

      vogogo.removeBankAccount(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _d.callCount.should.equal(1);
        _d.args[0][0].should.equal('/customers/asdf/bank_accounts/derp');
        _d.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should handle non-200 response code', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback(null, {statusCode: 400}, {error_message: 'Vogogo can\'t even right now'});
      });

      var params = {
        customerId: 'asdf',
        bankAccountId: 'derp'
      };

      vogogo.removeBankAccount(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 400 - Vogogo can\'t even right now');
        _d.callCount.should.equal(1);
        _d.args[0][0].should.equal('/customers/asdf/bank_accounts/derp');
        _d.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should remove a bank account', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _d = sandbox.stub(vogogo, '_delete', function(url, params, callback) {
        callback(null, {statusCode: 200}, 'success');
      });

      var params = {
        customerId: 'asdf',
        bankAccountId: 'derp'
      };

      vogogo.removeBankAccount(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.equal('success');
        _d.callCount.should.equal(1);
        _d.args[0][0].should.equal('/customers/asdf/bank_accounts/derp');
        _d.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });
  });

  describe('createCustomer', function() {
    var customerParams = {
      address_city: 'Toronto',
      address_country: 'CA',
      address_postal_code: 'M5P2N7',
      address_state: 'CA-ON',
      address_street_1: '1234 Main St - APPROVED',
      cell_phone_country: 1,
      cell_phone: 1234567890,
      ip: '1.1.1.1',
      is_business: false,
      email: 'gabe+1@bitpay.com',
      last_name: 'Dole',
      first_name: 'Bob',
      date_of_birth: '1950-01-01',
      occupation_id: '1'
    };

    it('should handle _post error', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var sandbox = sinon.sandbox.create();

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      vogogo.createCustomer(customerParams, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers');
        _p.args[0][1].should.deep.equal(customerParams);
        sandbox.restore();
        done();
      });
    });

    it('should create a customer 200', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var sandbox = sinon.sandbox.create();

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 200}, {hello: 'world'});
      });

      vogogo.createCustomer(customerParams, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({hello: 'world'});
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers');
        _p.args[0][1].should.deep.equal(customerParams);
        sandbox.restore();
        done();
      });
    });

    it('should create a customer 201', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var sandbox = sinon.sandbox.create();

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 201}, {hello: 'world'});
      });

      vogogo.createCustomer(customerParams, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.deep.equal({hello: 'world'});
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers');
        _p.args[0][1].should.deep.equal(customerParams);
        sandbox.restore();
        done();
      });
    });

    it('should hanle 420', function(done) {
      var vogogo = new Vogogo(constructorOptions);
      var sandbox = sinon.sandbox.create();

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 420}, {error_message: 'enhance your calm'});
      });

      customerParams.address_country = 'US';

      vogogo.createCustomer(customerParams, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 420 - enhance your calm');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers');
        _p.args[0][1].should.deep.equal(customerParams);
        sandbox.restore();
        done();
      });
    });
  });

  describe('getAccounts', function() {
    it('should handle _get error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      var params = {
        customerId: 'asdf'
      };

      vogogo.getAccounts(params, function(err, accounts) {
        should.exist(err);
        should.not.exist(accounts);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _g.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should handle bad status code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 999}, {error_message: 'NO! NO! NO!'});
      });

      var params = {
        currency: 'CAD',
        customerId: 'asdf'
      };

      vogogo.getAccounts(params, function(err, accounts) {
        should.exist(err);
        should.not.exist(accounts);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 999 - NO! NO! NO!');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _g.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should get accounts', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, [{foo: 'bar'}, {foo: 'baz'}]);
      });

      var params = {
        currency: 'CAD',
        customerId: 'asdf'
      };

      vogogo.getAccounts(params, function(err, accounts) {
        should.not.exist(err);
        should.exist(accounts);
        accounts.should.deep.equal([
          {
            foo: 'bar'
          },
          {
            foo: 'baz'
          }
        ]);
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/asdf/bank_accounts');
        _g.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should error if bad currency', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        currency: 'XYZ',
        customerId: 'asdf'
      };

      (function() {vogogo.getAccounts(params, function(){});}).should.throw(Error, /invalid currency/);
      done();
    });

    it('should error if no customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        currency: 'CAD'
      };

      (function() {vogogo.getAccounts(params, function(){});}).should.throw(Error, /customerId is a required parameter/);
      done();
    });

    it('should error if invalid customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        currency: 'CAD',
        customerId: {}
      };

      (function() {vogogo.getAccounts(params, function(){});}).should.throw(Error, /customerId must be a string/);
      done();
    });
  });

  describe('verifyMicroDeposit', function() {
    it('should handle _post error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      var params = {
        bankAccountId: 'derp',
        amount: 1.23,
        customerId: 'asdf'
      };

      vogogo.verifyMicroDeposit(params, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts/derp/micro_verifications');
        _p.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should handle bad status code', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 666}, {error_message: 'asdf'});
      });

      var params = {
        bankAccountId: 'derp',
        amount: 1.23,
        customerId: 'asdf'
      };

      vogogo.verifyMicroDeposit(params, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 666 - asdf');
        _p.callCount.should.equal(1);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts/derp/micro_verifications');
        _p.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should handle non verified status', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 200}, {status: 'derp'});
      });

      var params = {
        bankAccountId: 'derp',
        amount: 1.23,
        customerId: 'asdf'
      };

      vogogo.verifyMicroDeposit(params, function(err) {
        should.exist(err);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('account not verified - status: derp');
        _p.callCount.should.equal(1);
        _p.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });

    it('should error if no bankAccountId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        amount: 1,
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /bankAccountId is a required parameter/);

      done();
    });

    it('should error if bad bankAccountId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: {},
        amount: 1,
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /bankAccountId must be a string/);

      done();
    });

    it('should error if no amount', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /amount is a required parameter/);

      done();
    });

    it('should error if NaN amount', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        amount: 'asdf',
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /invalid amount/);

      done();
    });

    it('should error if infinity amount', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        amount: Infinity,
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /invalid amount/);

      done();
    });

    it('should error if 0 amount', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        amount: 0,
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /invalid amount/);

      done();
    });

    it('should error if negative amount', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        amount: -1,
        customerId: 'asdf'
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /invalid amount/);

      done();
    });

    it('should error if no customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        amount: 1,
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /customerId is a required parameter/);

      done();
    });

    it('should error if invalid customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {
        bankAccountId: '1234567890qwertyuiop',
        amount: 1,
        customerId: {}
      };

      (function(){
        vogogo.verifyMicroDeposit(params, function(){});
      }).should.throw(Error, /customerId must be a string/);

      done();
    });

    it('should verify the micro deposit', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var _p = sandbox.stub(vogogo, '_post', function(url, params, callback) {
        callback(null, {statusCode: 200}, {status: 'verified'});
      });

      var params = {
        bankAccountId: 'derp',
        amount: 1.23,
        customerId: 'asdf'
      };

      vogogo.verifyMicroDeposit(params, function(err) {
        should.not.exist(err);
        _p.args[0][0].should.equal('/customers/asdf/bank_accounts/derp/micro_verifications');
        _p.callCount.should.equal(1);
        _p.args[0][1].should.equal(params);
        sandbox.restore();
        done();
      });
    });
  });

  describe('listBankAccounts', function() {
    it('should error if no customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {};

      (function(){
        vogogo.listBankAccounts(params, function(){});
      }).should.throw(Error, /customerId is a required parameter/);

      done();
    });

    it('should error if non-string customerId', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var params = {customerId: {}};

      (function(){
        vogogo.listBankAccounts(params, function(){});
      }).should.throw(Error, /customerId must be a string/);

      done();
    });

    it('should handle _get error', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(new Error('this is an error'));
      });

      var params = {customerId: 'qwertyuiop'};

      vogogo.listBankAccounts(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/qwertyuiop/bank_accounts');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should handle bad status code', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 500}, {error_message: 'this is an error'});
      });

      var params = {customerId: 'qwertyuiop'};

      vogogo.listBankAccounts(params, function(err, body) {
        should.exist(err);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('bad status code: 500 - this is an error');
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/qwertyuiop/bank_accounts');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });

    it('should get the bank accounts', function(done) {
      var sandbox = sinon.sandbox.create();

      var vogogo = new Vogogo(constructorOptions);

      var response = [
        {
          id: 'fd1d2295-7a96-4259-a916-4de9bdf9bb53',
          type: 'bank',
          name: 'My Chase Savings',
          currency: 'USD',
          last4: '1193',
          financial_type: 'checking',
          status: 'verified',
          error_messages: []
        },
        {
          id: '65d4f40f-8bfc-44f0-a9a2-cbcd3d6b4247',
          type: 'bank',
          name: 'My ATB Savings',
          currency: 'CAD',
          last4: '9393',
          financial_type: 'checking',
          status: 'verified',
          error_messages: []
        }
      ];

      var _g = sandbox.stub(vogogo, '_get', function(url, params, callback) {
        callback(null, {statusCode: 200}, response);
      });

      var params = {customerId: 'qwertyuiop'};

      vogogo.listBankAccounts(params, function(err, body) {
        should.not.exist(err);
        should.exist(body);
        body.should.equal(response);
        _g.callCount.should.equal(1);
        _g.args[0][0].should.equal('/customers/qwertyuiop/bank_accounts');
        _g.args[0][1].should.deep.equal({});
        sandbox.restore();
        done();
      });
    });
  });

  describe('_generateAuthToken', function() {
    it('should generate the auth token', function(done) {
      var vogogo = new Vogogo(constructorOptions);

      var authToken = vogogo._generateAuthToken();
      var goodToken = 'Basic ZmIzOTdmZGY4ZDI4ZWE3MmVjNjkwMWZlMTg2ZWI3NGE2ZGUyODEyNWFlMDI2YTE0ZmFkZTU4ZWFiYWZkOWI1MDo=';
      authToken.should.equal(goodToken);
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
          url: 'https://api.vogogo.com/v3/pay',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {
            herp: 'derp',
            device_id: 'blahblahblah',
            ip: '127.0.0.1'
          },
          json: true
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
          url: 'https://api.vogogo.com/v3/pay',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {
            herp: 'derp',
            device_id: 'blahblahblah',
            ip: '127.0.0.1'
          },
          json: true
        });
        sandbox.restore();
        done();
      });
    });
  });

  describe('_get', function() {
    it('should make a get with the right url, params', function(done) {
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
        ge.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v3/transactions',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {
            herp: 'derp',
            device_id: 'blahblahblah',
            ip: '127.0.0.1'
          },
          json: true
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
          url: 'https://api.vogogo.com/v3/transactions',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {
            device_id: 'blahblahblah',
            ip: '127.0.0.1'
          },
          json: true
        });
        sandbox.restore();
        done();
      });
    });
  });

  describe('_delete', function() {
    it('should make a get with the right url, params', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var de = sandbox.stub(request, 'del', function(options, callback) {
        callback(null, {statusCode: 200}, {foo: 'bar'});
      });

      var ga = sandbox.stub(vogogo, '_generateAuthToken', function() {
        return 'Basic 12345678';
      });

      vogogo._delete('/transactions', {herp: 'derp'}, function(err, res, body) {
        should.not.exist(err);
        should.exist(res);
        should.exist(body);
        res.should.deep.equal({statusCode: 200});
        body.should.deep.equal({foo: 'bar'});
        ga.callCount.should.equal(1);
        de.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v3/transactions',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {
            herp: 'derp',
            device_id: 'blahblahblah',
            ip: '127.0.0.1'
          },
          json: true
        });
        sandbox.restore();
        done();
      });
    });

    it('should handle request error', function(done) {
      var sandbox = sinon.sandbox.create();
      var vogogo = new Vogogo(constructorOptions);

      var de = sandbox.stub(request, 'del', function(options, callback) {
        callback(new Error('this is an error'));
      });

      var ga = sandbox.stub(vogogo, '_generateAuthToken', function() {
        return 'Basic 12345678';
      });

      vogogo._delete('/transactions', {}, function(err, res, body) {
        should.exist(err);
        should.not.exist(res);
        should.not.exist(body);
        err.should.be.an.instanceOf(Error);
        err.message.should.equal('this is an error');
        ga.callCount.should.equal(1);
        de.callCount.should.equal(1);
        de.args[0][0].should.deep.equal({
          url: 'https://api.vogogo.com/v3/transactions',
          headers: {
            Authorization: 'Basic 12345678',
            'Content-Type': 'application/json'
          },
          qs: {
            device_id: 'blahblahblah',
            ip: '127.0.0.1'
          },
          json: true
        });
        sandbox.restore();
        done();
      });
    });
  });
});
