require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, API_TOKEN } = require('./config');
const { v4: uuid } = require('uuid');
const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
app.use(cors());
function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');
  console.log(authToken);
  console.log(API_TOKEN);

  if (!authToken || authToken.split(' ')[1] !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  next();
}

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/address', (req, res) => {
  res.send(addresses);
});

const addresses = [];

app.post('/address', validateBearerToken, (req, res) => {
  const {
    id = uuid(),
    firstName,
    lastName,
    address1,
    address2 = '',
    city,
    state,
    zip,
  } = req.query;

  const zipNumber = parseInt(zip);

  if (!firstName) {
    return res.status(400).send('First name required');
  }
  if (!lastName) {
    return res.status(400).send('Last name required');
  }
  if (!address1) {
    return res.status(400).send('Address is required');
  }
  if (!city) {
    return res.status(400).send('City is required');
  }
  if (!state) {
    return res.status(400).send('State is required');
  }
  if (!zip) {
    return res.status(400).send('Zipcode is required');
  }
  if (zip.length !== 5 || typeof zipNumber !== 'number') {
    return res.status(400).send('Zipcode must be a 5 digit number');
  }
  if (state.length !== 2 || typeof state !== 'string') {
    return res.status(400).send('State must be 2 letters');
  }

  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip,
  };
  addresses.push(newAddress);
  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json(newAddress);
});

app.delete('/address/:id', validateBearerToken, (req, res) => {
  const indexOfAddress = addresses.findIndex(
    (address) => address.id === req.params.id
  );
  addresses.splice(indexOfAddress, 1);
  res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
