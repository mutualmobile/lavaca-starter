define(function(require) {

  var Config = {};

  switch(window.env) {
    default:
      Config = {
        "mock_url": "assets/mock/{0}.json"
      };
  }

  return Config;

});