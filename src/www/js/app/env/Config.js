var cfg = {};

switch(window.env) {
  case 'production':
      cfg = {};
      break;
  case 'staging':
      cfg = {};
      break;
  default:
      cfg = {};
}

export let Config = cfg;