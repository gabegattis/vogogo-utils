module.exports = {
  authParams: {
    clientId: '9ea36e3c81fae645023317f22f273d2da48edd7d2053b58569c2e4a83dabc53c',
    clientSecret: '8ea1ae026d14fafb3942bc69701fe5de7fdf2d28bffd12ea9b5286eb74a6dd28',
  },
  environments: {
    staging: {
      apiPrefix: 'https://staging.api.vogogo.com/v3'
    },
    production: {
      apiPrefix: 'https://api.vogogo.com/v3'
    }
  },
  deviceId: '123bp',
  defaultEnvironment: 'staging',
  ipAddress: '127.0.0.1' // vogogo asks for an ip address for each request, we just give localhost
};
