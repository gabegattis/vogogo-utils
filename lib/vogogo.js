'use strict';

var request = require('request');
var assert = require('assert');

var SUPPORTED_CURRENCIES = ['USD', 'CAD'];
var SUPPORTED_FINANCIAL_TYPES = ['checking', 'savings'];

function Vogogo(options) {
  checkOptions(options);

  this.clientId = options.clientId;
  this.clientSecret = options.clientSecret;
  this.apiPrefix = options.apiPrefix;
  this.deviceId = options.deviceId;
  this.ipAddress = options.ipAddress;
}

function checkOptions(options) {
  assert(options.clientId !== undefined, 'you must supply a clientId in the constructor options');
  assert(options.clientSecret !== undefined, 'you must supply a clientSecret in the constructor options');
  assert(options.apiPrefix !== undefined, 'you must supply an apiPrefix in the constructor options');
  assert(options.ipAddress !== undefined, 'you must supply an ipAddress in the constructor options');
  assert(options.deviceId !== undefined, 'you must supply a deviceId in the constructor options');

  assert(typeof options.clientId === 'string', 'clientId must be a string');
  assert(typeof options.clientSecret === 'string', 'clientSecret must be a string');
  assert(typeof options.apiPrefix === 'string', 'apiPrefix must be a string');
  assert(typeof options.ipAddress === 'string', 'ipAddress must be a string');
  assert(typeof options.deviceId === 'string', 'deviceId must be a string');

  assert(options.ipAddress.length <= 32, 'ipAddress must be 32 characters or less');
}

Vogogo.prototype.pay = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/bank';
  delete params.customerId;
  self._post(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback();
  });

  function validateParams(params) {
    assert(params.merchant_transaction_id !== undefined, 'merchant_transaction_id is a required parameter');
    assert(params.account_id !== undefined, 'account_id is a required parameter');
    assert(params.amount !== undefined, 'amount is a required parameter');
    assert(params.currency !== undefined, 'currency is a required parameter');
    assert(params.customerId !== undefined, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');
    assert(params.type !== undefined, 'type is a required parameter');

    assert(typeof params.merchant_transaction_id === 'string', 'id must be a string');
    assert(params.merchant_transaction_id.length <= 36, 'id must be 36 characters or less');
    assert(typeof params.account_id === 'string', 'account_id must be a string');
    var amount = parseFloat(params.amount);
    assert(!isNaN(amount) && isFinite(amount) && amount > 0, 'invalid amount');
    assert(typeof params.currency === 'string', 'currency must be a string');
    assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, params.currency + ' is not a supported currency');
    assert(['pay', 'charge'].indexOf(params.type) !== -1, params.type + ' is an invalid type');
  }
};

Vogogo.prototype.getTransaction = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/transactions/' + params.txid;
  delete params.customerId;
  delete params.txid;
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
    assert(params.customerId !== undefined, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');
    assert(params.txid !== undefined, 'txid is a required parameter');
    assert(typeof params.txid === 'string', 'txid must be a string');
  }
};

Vogogo.prototype.listTransactions = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/transactions';
  delete params.customerId;
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
    assert(params.customerId !== undefined, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');
  }
};

Vogogo.prototype.addBankAccount = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/bank_accounts';
  delete params.customerId;
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
    assert(params.name !== undefined, 'name is a required parameter');
    assert(typeof params.name === 'string' && params.name.length <= 50, 'invalid name');
    assert(params.number !== undefined, 'number is a required parameter');
    assert(params.currency !== undefined, 'currency is a required parameter');
    assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, 'invalid currency');
    assert(params.financial_type !== undefined, 'financial_type is a required parameter');
    assert(SUPPORTED_FINANCIAL_TYPES.indexOf(params.financial_type) !== -1, 'invalid financial_type');
    assert(params.customerId !== undefined, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');

    if (params.currency === 'USD') {
      assert(params.routing !== undefined, 'routing is a required parameter for USD accounts');
      assert(typeof params.routing === 'string' && params.routing.length === 9, 'invalid routing');
      assert(typeof params.number === 'string' && params.number.length >= 6 && params.number.length <= 17,
        'invalid number');
    }

    if (params.currency === 'CAD') {
      assert(params.institution !== undefined, 'institution is a required parameter for CAD accounts');
      assert(typeof params.institution === 'string' && params.institution.length === 3, 'invalid institution');
      assert(params.transit !== undefined, 'transit is a required parameter for CAD accounts');
      assert(typeof params.transit === 'string' && params.transit.length === 5, 'invalid transit');
      assert(typeof params.number === 'string' && params.number.length >= 7 && params.number.length <= 15,
        'invalid number');
    }
  }
};

Vogogo.prototype.removeBankAccount = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/bank_accounts/' + params.bankAccountId;
  delete params.customerId;
  delete params.bankAccountId;

  self._delete(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback(null, body);
  });

  function validateParams(params) {
    assert(params.customerId !== undefined, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');
    assert(params.bankAccountId !== undefined, 'bankAccountId is a required parameter');
    assert(typeof params.bankAccountId === 'string', 'bankAccountId must be a string');
  }
};

Vogogo.prototype.createCustomer = function(params, callback) {
  var self = this;
  validateParams(params);

  var url = '/customers';
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
    assert(params.address_city !== undefined, 'address_city is a required param');
    assert(params.address_country !== undefined, 'address_country is a required param');
    assert(params.address_postal_code !== undefined, 'address_postal_code is a required param');
    assert(params.address_state !== undefined, 'address_state is a required param');
    assert(params.address_street_1 !== undefined, 'address_street_1 is a required param');
    assert(params.cell_phone_country !== undefined, 'cell_phone_country is a required param');
    assert(params.cell_phone !== undefined, 'cell_phone is a required param');
    assert(params.is_business !== undefined, 'is_business is a required param');
    assert(params.email !== undefined, 'email is a required param');
    assert(params.last_name !== undefined, 'last_name is a required param');
    assert(params.first_name !== undefined, 'first_name is a required param');
    assert(params.date_of_birth !== undefined, 'date_of_birth is a required param');
    if (params.address_country === 'CA') {
      assert(params.occupation_id !== undefined, 'occupation_id is a required param for Canadian customers');
    }
  }
};

Vogogo.prototype.getAccounts = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/bank_accounts';
  delete params.customerId;
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
      assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, 'invalid currency');
    }
    assert(params.customerId !== undefined, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');
  }
};

Vogogo.prototype.verifyMicroDeposit = function(params, callback) {
  var self = this;
  validateParams(params);
  var url = '/customers/' + params.customerId + '/bank_accounts/' + params.bankAccountId + '/micro_verifications';
  delete params.customerAccessToken;
  self._post(url, params, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    if (body.status !== 'verified') {
      return callback(new Error('account not verified - status: ' + body.status));
    }

    callback();
  });

  function validateParams(params) {
    assert(params.bankAccountId !== undefined, 'bankAccountId is a required parameter');
    assert(typeof params.bankAccountId === 'string', 'bankAccountId must be a string');
    assert(params.amount !== undefined, 'amount is a required parameter');
    var amount = parseFloat(params.amount);
    assert(!isNaN(amount) && isFinite(amount) && amount > 0, 'invalid amount');
    assert(params.customerId, 'customerId is a required parameter');
    assert(typeof params.customerId === 'string', 'customerId must be a string');
  }
};

/**
* HTTP basic auth
* client secret as username
* no password
*/
Vogogo.prototype._generateAuthToken = function() {
  var username = this.clientSecret;
  var password = '';
  var userpass = username + ':' + password;
  var encodedUserPass = new Buffer(userpass, 'UTF-8').toString('base64');
  var authToken = 'Basic ' + encodedUserPass;
  return authToken;
};

Vogogo.prototype._post = function(url, params, callback) {
  params.device_id = this.deviceId;
  params.ip =  this.ipAddress;
  request.post({
    url: this.apiPrefix + url,
    headers: {
      Authorization: this._generateAuthToken(),
      'Content-Type': 'application/json'
    },
    qs: params,
    json: true
  }, callback);
};

Vogogo.prototype._get = function(url, params, callback) {
  params.device_id = this.deviceId;
  params.ip =  this.ipAddress;
  request.get({
    url: this.apiPrefix + url,
    headers: {
      'Authorization': this._generateAuthToken(),
      'Content-Type': 'application/json'
    },
    qs: params,
    json: true
  }, callback);
};

Vogogo.prototype._delete = function(url, params, callback) {
  params.device_id = this.deviceId;
  params.ip =  this.ipAddress;
  request.del({
    url: this.apiPrefix + url,
    headers: {
      'Authorization': this._generateAuthToken(),
      'Content-Type': 'application/json'
    },
    qs: params,
    json: true
  }, callback);
};

module.exports = Vogogo;
