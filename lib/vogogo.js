'use strict';

var request = require('request');
var assert = require('assert');
var config = require('../config');

var SUPPORTED_CURRENCIES = ['USD', 'CAD'];

function Vogogo(options) {
  checkOptions(options);

  this.clientId = options.clientId;
  this.clientSecret = options.clientSecret;
  this.customerAccessToken = options.customerAccessToken;

  this.apiPrefix = options.apiPrefix || config.environments.production.apiPrefix;
}

function checkOptions(options) {
  assert(options.clientId, 'you must supply a clientId in the constructor options');
  assert(options.clientSecret, 'you must supply a clientSecret in the constructor options');
  //assert(options.customerAccessToken, 'you must supply a customerAccessToken in the constructor options');
  assert(typeof options.clientId === 'string', 'clientId must be a string');
  assert(typeof options.clientSecret === 'string', 'clientSecret must be a string');
  //assert(typeof options.customerAccessToken === 'string', 'customerAccessToken must be a string');

  if (options.apiPrefix) {
    assert(typeof options.apiPrefix === 'string', 'apiPrefix must be a string');
  }
}

Vogogo.prototype.pay = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/pay';
  self._post(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode === 403) {
      return callback(new Error('403 FORBIDDEN - ' + body.error_message));
    }

    if (res.statusCode === 409) {
      return callback(new Error('409 CONFLICT - ' + body.error_message));
    }

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback();
  });

  function validateParams(params) {
    assert(params.id !== undefined, 'id is a required parameter');
    assert(params.account_id !== undefined, 'account_id is a required parameter');
    assert(params.amount !== undefined, 'amount is a required parameter');
    assert(params.currency !== undefined, 'currency is a required parameter');
    assert(params.ip !== undefined, 'ip is a required parameter');

    assert(typeof params.id === 'string', 'id must be a string');
    assert(params.id.length <= 36, 'id must be 36 characters or less');
    assert(typeof params.account_id === 'string', 'account_id must be a string');
    var amount = parseFloat(params.amount);
    assert(!isNaN(amount) && isFinite(amount) && amount > 0, 'invalid amount');
    assert(typeof params.currency === 'string', 'currency must be a string');
    assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, params.currency + ' is not a supported currency');
    assert(typeof params.ip === 'string', 'ip must be a string');
    assert(params.ip.length <= 32, 'ip must be 32 characters or less');
  }
};

Vogogo.prototype.getTransaction = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/transactions/' + params.id;
  self._get(url, {}, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback(null, body);
  });

  function validateParams(params) {
    assert(params.id, 'id is a required parameter');
    assert(typeof params.id === 'string', 'id must be a string');
  }
};

Vogogo.prototype.listTransactions = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/transactions';
  self._get(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback(null, body);
  });

  function validateParams(params) {
    if (params.currency) {
      assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, params.currency + ' is not a supported currency');
    }
  }
};

Vogogo.prototype.addBankAccount = function(params, callback) {
  var self = this;
  validateParams(params);

  var url = '/accounts';
  self._post(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback(null, body);
  });

  function validateParams(params) {
    //
  }
};

Vogogo.prototype.createCustomer = function(params, callback) {
  var self = this;
  validateParams(params);
  var params = {
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
    date_of_birth: '1900-01-01',
    occupation_id: '1'
  };

  var url = '/customers';
  self._post(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode === 403) {
      return callback(new Error('403 FORBIDDEN - ' + body.error_message));
    }

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback(null, body);
  });

  function validateParams(params) {
    //address_city
    //address_country
    //address_postal_code
    //address_state
    //address_street_1  // set to "APPROVED" in staging environment, "100 Main St - APPROVED"
    //address_street_2  //  optional
    //celll_phone_country
    //cell_phone
    //device_id  //  optional
    //ip
    //is_business
    //email
    //last_name
    //first_name
    //date_of_birth
    //occupation_id  //  canada only
    //employer  //  optional
  }
};

/**
* HTTP basic auth
*/
Vogogo.prototype._generateAuthToken = function() {
  var username = config.authParams.clientSecret;
  var password = config.authParams.customerAccessToken;
  var userpass = username + ':' + password;
  var encodedUserPass = new Buffer(userpass, 'UTF-8').toString('base64');
  var authToken = 'Basic ' + encodedUserPass;
  return authToken;
};

Vogogo.prototype._post = function(url, params, callback) {
  request.post({
    url: this.apiPrefix + url,
    headers: {
      Authorization: this._generateAuthToken(),
      'Content-Type': 'application/json'
    },
    qs: params
  }, callback);
};

Vogogo.prototype._get = function(url, params, callback) {
  request.get({
    url: this.apiPrefix + url,
    headers: {
      'Authorization': this._generateAuthToken(),
      'Content-Type': 'application/json'
    },
    qs: params
  }, callback);
};

module.exports = Vogogo;
