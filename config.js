module.exports = {
  authParams: {
    clientId: '9ea36e3c81fae645023317f22f273d2da48edd7d2053b58569c2e4a83dabc53c',
    clientSecret: '8ea1ae026d14fafb3942bc69701fe5de7fdf2d28bffd12ea9b5286eb74a6dd28',
    //customerAccessToken: '7107d534-d8b1-4b55-80e9-1822c9bf62c8' //gabe gattis
    customerAccessToken: 'cc845722-cd84-41ff-98f2-56a8b1a7732f' //bob dole
  },
  environments: {
    staging: {
      apiPrefix: 'https://staging.api.vogogo.com/v2'
    },
    production: {
      apiPrefix: 'https://api.vogogo.com/v2'
    }
  },
  defaultEnvironment: 'staging'
};
