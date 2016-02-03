var Config = {};

  switch(window.env) {
    case 'production':
        Config = {};
        break;
    case 'staging':
        Config = {};
        break;
    default:
        Config = {};
  }
module.exports = Config;