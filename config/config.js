require('dotenv').config();
const env = process.env;

const development = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: env.DB_DIALECT,
};

const production = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: env.DB_DIALECT,
};

const test = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  dialect: env.DB_DIALECT,
};

module.exports = { development, production, test };