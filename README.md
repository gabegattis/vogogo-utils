vogogo-utils
=======

An unofficial javascript library and command-line utility set for interacting with the Vogogo v3 API.

## Setup
```bash
git clone git@github.com:gabegattis/vogogo-utils.git
cd vogogo-utils
npm install
```

## Usage

### Configuration

Any file that requires the config should require vogogo-utils/config.js. This will handle combining the user-specified config with the default config. vogogo-utils/defaultConfig.js is the default config file. If you wish to override any config options, you can create your own config in vogogo-utils/userConfig.js. Anything included in the user config will override the defaults. Any values that are not specified in the user config will be set to the defaults.

The config is only used by the command-line utilities in vogogo-utils/utils.

### Class: Vogogo

The vogogo-utils/vogogo.js contains all the methods you will need to use.


#### new Vogogo(options)

Vogogo can be instantiated using an options object. If you leave out any options, the constructor will attempt to use the config instead.

* **clientId** - string - Currently vogogo-utils does not use the clientId, but Vogogo give it's users one anyway.
* **clientSecret** - string - This is used for authentication of all API calls. Please keep this secure!
* **apiPrefix** - string - This is used to determine where to make the api calls. This is mainly to choose between Vogogo's production server and their staging server.
* **deviceId** - string - Device identifier  to send to Vogogo with each call. AFAIK, this can be anything.
* **ipAddress** - string - Ip address to send to Vogogo with each call. AFAIK, this can be anything.

```js
var Vogogo = require('vogogo-utils');
var options = {
  clientId: 'maryHadALittleLambWhoseFleeceWasGreenAsCactus',
  clientSecret: 'shhhhhhDontTellAnybody',
  apiPrefix: 'https://staging.api.vogogo.com/v3',
  ipAddress: '127.0.0.1',
  deviceId: 'thisIsTheIdOfThisDevicelol'
};
var vogogo = new Vogogo(options);

```


#### vogogo.pay(params, callback)

Sends a payment to a customer's bank account

* **merchant_transaction_id** - string - new id specified by the user
* **account_id** - string - id of bank account
* **amount** - string
* **currency** - string - either "CAD" or "USD"
* **customerId** - string
* **type** - string - either "pay" or "charge"


#### vogogo.getTransaction(params, callback)

Get details of a transaction

* **txid** - string - Vogogo's transaction id, not the merchant_transaction_id
* **customerId** - string



#### vogogo.listTransactions(params, callback)

List transactions for a given customer

* **customerId** - string
* **currency** - string (optional)


#### vogogo.addBankAccount(params, callback)

Add a new bank account to an existing customer

* **name** - string - name of bank account
* **currency** - string
* **financial_type** - string - either "savings" or "checking"
* **customerId** - string

for currency USD
* **routing** - string - 9-digit numerical string
* **number** - string - between 6 and 17 characters (inclusive)

for currency CAD
* **institution** - string - 3-digit numerical string
* **transit** - string - 5-digit numerical string
* **number** - string - between 7 and 15 characters (inclusive)


#### vogogo.removeBankAccount(params, callback)

Remove a bank account from a customer

* **merchant_transaction_id** - string - new id specified by the user
* **bankAccountId** - string - id of bank account


#### vogogo.createCustomer(params, callback)

Create a new customer
* **address_city** - string
* **address_country** - string
* **address_postal_code** - string
* **address_state** - string
* **address_street_1** - string
* **address_street_2** - string (optional)
* **cell_phone_country** - string
* **cell_phone** - string
* **is_business** - boolean
* **email** - string
* **last_name** - string
* **first_name** - string
* **date_of_birth** - string
* **occupation_id** - string (optional) - Canada only
* **employer** - string (optional) - mandatory if occupation is "Other"
* **employer_description** - string (optional) - mandatory if occupation is "Other"


#### vogogo.getAccounts(params, callback)

List bank accounts for a given customer

* **customerId** - string
* **currency** - string (optional)


#### vogogo.verifyMicroDeposit(params, callback)

Verifies a new bank account by verifying the micro-deposit made to the account by Vogogo

* **bankAccountId** - string - id of bank account
* **amount** - number
* **customerId** - string


### Command line utilities
Located in vogogo-utils/utils


#### addBankAccount

usage: ./addBankAccount <customer> <name> <institution> <transit> <routing> <number> <currency> <financial_type>
note that some fields are currency specific. use "null" for these fields


#### createCustomer

usage: ./createCustomer <address_city> <address_country> <address_postal_code> <address_state> <address_street_1> <cell_phone_country> <cell_phone> <is_business> <email> <last_name> <first_name> <date_of_birth> <occupation_id>


#### getAccounts

usage: ./getAccounts <customer> <currency> (optional)


#### getTransaction

usage: ./getTransaction <customerId> <txid>


#### listTransactions

usage: ./listTransactions <customer> <currency> (optional)


#### pay

usage: ./pay <customer> <transaction id> <account_id> <amount> <currency>


#### removeBankAccount

usage: ./removeBankAccount <customer> <bankAccountId>


#### verifyMicroDeposit

usage: ./verifyMicroDeposit <customer> <bank account id> <amount>


## Testing

vogogo-utils uses mocha for unit testing. To run the tests, do
```bash
npm test
```

To run tests with the code coverage report, do
```bash
npm run coverage
```

This will generate an lcov report. View this in your browser by opening vogogo-utils/coverage/lcov-report/index.html
