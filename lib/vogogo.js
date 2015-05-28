'use strict';

var request = require('request');
var assert = require('assert');
var config = require('../config');

var SUPPORTED_CURRENCIES = ['USD', 'CAD'];
var SUPPORTED_FINANCIAL_TYPES = ['checking', 'savings'];

function Vogogo(options) {
  checkOptions(options);

  this.clientId = options.clientId;
  this.clientSecret = options.clientSecret;

  this.apiPrefix = options.apiPrefix || config.environments.production.apiPrefix;
}

function checkOptions(options) {
  assert(options.clientId, 'you must supply a clientId in the constructor options');
  assert(options.clientSecret, 'you must supply a clientSecret in the constructor options');
  assert(typeof options.clientId === 'string', 'clientId must be a string');
  assert(typeof options.clientSecret === 'string', 'clientSecret must be a string');

  if (options.apiPrefix) {
    assert(typeof options.apiPrefix === 'string', 'apiPrefix must be a string');
  }
}

Vogogo.prototype.pay = function(params, callback) {
  var self = this;
  validateParams(params);
  var customerAccessToken = params.customerAccessToken;
  delete params.customerAccessToken;
  var url = '/pay';
  self._post(url, params, {customerAccessToken: customerAccessToken}, function(err, res, body) {
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
    assert(params.customerAccessToken, 'customerAccessToken is a required parameter');
    assert(typeof params.customerAccessToken === 'string', 'customerAccessToken must be a string');

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
  var customerAccessToken = params.customerAccessToken;
  delete params.customerAccessToken;
  var url = '/transactions/' + params.id;
  self._get(url, {}, {customerAccessToken: customerAccessToken}, function(err, res, body) {
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
    assert(params.customerAccessToken, 'customerAccessToken is a required parameter');
    assert(typeof params.customerAccessToken === 'string', 'customerAccessToken must be a string');
  }
};

Vogogo.prototype.listTransactions = function(params, callback) {
  var self = this;
  validateParams(params);
  var customerAccessToken = params.customerAccessToken;
  delete params.customerAccessToken;
  var url = '/transactions';
  self._get(url, params, {customerAccessToken: customerAccessToken}, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    if (!body.transactions) {
      return callback(new Error('no transactions array in response from Vogogo'));
    }

    callback(null, body.transactions);
  });

  function validateParams(params) {
    if (params.currency) {
      assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, params.currency + ' is not a supported currency');
    }
    assert(params.customerAccessToken, 'customerAccessToken is a required parameter');
    assert(typeof params.customerAccessToken === 'string', 'customerAccessToken must be a string');
  }
};

Vogogo.prototype.addBankAccount = function(params, callback) {
  var self = this;
  validateParams(params);
  var customerAccessToken = params.customerAccessToken;
  delete params.customerAccessToken;
  var url = '/accounts';
  self._post(url, params, {customerAccessToken: customerAccessToken}, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    callback(null, body);
  });

  function validateParams(params) {
    assert(params.name, 'name is a required parameter');
    assert(typeof params.name === 'string' && params.name.length <= 50, 'invalid name');
    assert(params.number, 'number is a required parameter');
    assert(params.currency, 'currency is a required parameter');
    assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, 'invalid currency');
    assert(params.financial_type, 'financial_type is a required parameter');
    assert(SUPPORTED_FINANCIAL_TYPES.indexOf(params.financial_type) !== -1, 'invalid financial_type');
    assert(params.customerAccessToken, 'customerAccessToken is a required parameter');
    assert(typeof params.customerAccessToken === 'string', 'customerAccessToken must be a string');

    if (params.currency === 'USD') {
      assert(params.routing, 'routing is a required parameter for USD accounts');
      assert(typeof params.routing === 'string' && params.routing.length === 9, 'invalid routing');
      assert(typeof params.number === 'string' && params.number.length >= 6 && params.number.length <= 17,
        'invalid number');
    }

    if (params.currency === 'CAD') {
      assert(params.institution, 'institution is a required parameter for CAD accounts');
      assert(typeof params.institution === 'string' && params.institution.length === 3, 'invalid institution');
      assert(params.transit, 'transit is a required parameter for CAD accounts');
      assert(typeof params.transit === 'string' && params.transit.length === 5, 'invalid transit');
      assert(typeof params.number === 'string' && params.number.length >= 7 && params.number.length <= 15,
        'invalid number');
    }
  }
};

Vogogo.prototype.createCustomer = function(params, callback) {
  var self = this;
  validateParams(params);

  var url = '/customers';
  self._post(url, params, {}, function(err, res, body) {
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
    assert(params.address_city !== undefined, 'address_city is a required param');
    assert(params.address_country !== undefined, 'address_country is a required param');
    assert(params.address_postal_code !== undefined, 'address_postal_code is a required param');
    assert(params.address_state !== undefined, 'address_state is a required param');
    assert(params.address_street_1 !== undefined, 'address_street_1 is a required param');
    assert(params.cell_phone_country !== undefined, 'cell_phone_country is a required param');
    assert(params.cell_phone !== undefined, 'cell_phone is a required param');
    assert(params.ip !== undefined, 'ip is a required param');
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
  var customerAccessToken = params.customerAccessToken;
  delete params.customerAccessToken;
  var url = '/accounts';
  self._get(url, params, {customerAccessToken: customerAccessToken}, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('bad status code: ' + res.statusCode + ' - ' + body.error_message));
    }

    if (!body.accounts) {
      return callback(new Error('no accounts array in response from Vogogo'));
    }

    callback(null, body.accounts);
  });

  function validateParams(params) {
    assert(params.currency, 'currency is a required parameter');
    assert(SUPPORTED_CURRENCIES.indexOf(params.currency) !== -1, 'invalid currency');
    assert(params.customerAccessToken, 'customerAccessToken is a required parameter');
    assert(typeof params.customerAccessToken === 'string', 'customerAccessToken must be a string');
  }
};

Vogogo.prototype.verifyMicroDeposit = function(params, callback) {
  var self = this;
  validateParams(params);
  var customerAccessToken = params.customerAccessToken;
  delete params.customerAccessToken;

  var url = '/accounts/' + params.id + '/verify';

  self._post(url, params, {customerAccessToken: customerAccessToken}, function(err, res, body) {
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
    assert(params.id !== undefined, 'id is a required parameter');
    assert(typeof params.id === 'string', 'id must be a string');
    assert(params.amount !== undefined, 'amount is a required parameter');
    var amount = parseFloat(params.amount);
    assert(!isNaN(amount) && isFinite(amount) && amount > 0, 'invalid amount');
    assert(params.customerAccessToken, 'customerAccessToken is a required parameter');
    assert(typeof params.customerAccessToken === 'string', 'customerAccessToken must be a string');
  }
};

/**
* HTTP basic auth
*/
Vogogo.prototype._generateAuthToken = function(params) {
  var username = this.clientSecret;
  var password = (params && params.customerAccessToken) || '';
  var userpass = username + ':' + password;
  var encodedUserPass = new Buffer(userpass, 'UTF-8').toString('base64');
  var authToken = 'Basic ' + encodedUserPass;
  return authToken;
};

Vogogo.prototype._post = function(url, params, authParams, callback) {
  request.post({
    url: this.apiPrefix + url,
    headers: {
      Authorization: this._generateAuthToken(authParams),
      'Content-Type': 'application/json'
    },
    qs: params
  }, function(err, res, body) {
    if (body) {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return callback(new Error('failed to parse response from Vogogo'));
      }
    }

    callback(err, res, body);
  });
};

Vogogo.prototype._get = function(url, params, authParams, callback) {
  request.get({
    url: this.apiPrefix + url,
    headers: {
      'Authorization': this._generateAuthToken(authParams),
      'Content-Type': 'application/json'
    },
    qs: params
  }, function(err, res, body) {
    if (body) {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return callback(new Error('failed to parse response from Vogogo'));
      }
    }

    callback(err, res, body);
  });
};

module.exports = Vogogo;
