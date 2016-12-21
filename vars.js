var env = {
  setVars: setEnvironment
};

function setEnvironment(req) {
  if (req.webtaskContext != null) {
    env.AUTH0_DOMAIN = req.webtaskContext.secrets.AUTH0_DOMAIN;
    env.AUTH0_CLIENT_ID = req.webtaskContext.secrets.AUTH0_CLIENT_ID;
    env.AUTH0_CONNECTION_NAME = req.webtaskContext.secrets.AUTH0_CONNECTION_NAME;
    env.AUTH0_MANAGEMENT_TOKEN = req.webtaskContext.secrets.AUTH0_MANAGEMENT_TOKEN;
  } else {
    require('dotenv').config();
    env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
    env.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
    env.AUTH0_CONNECTION_NAME = process.env.AUTH0_CONNECTION_NAME;
    env.AUTH0_MANAGEMENT_TOKEN = process.env.AUTH0_MANAGEMENT_TOKEN;
  }
}

module.exports = env;
