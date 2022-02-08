const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
//const authorize = require('../middleware/authorize');
const Secret = require('../models/Secret');

module.exports = Router()
  .post('/', authenticate, async (req, res, next) => {
    try {
      const secrets = await Secret.insert(req.body);
      console.log({ secrets });
      res.send(secrets);
    } catch (error) {
      next(error);
    }
  })
  //getAll route
  .get('/', authenticate, async (req, res, next) => {
    try {
      const secrets = await Secret.getAll();
      res.send(secrets);
    } catch (error) {
      next(error);
    }
  });
