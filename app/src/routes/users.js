const express = require('express');
const router = express.Router();
const user = require('../services/users');
const logger = require('../middlewares/logger')

//Signup @params(route, loggerMiddleware, service)
router.post('/signup', (req, res, next) => logger.loggerTransactions(req, res, next, 'signup'), user.signUp);

//Login users @params(route, loggerMiddleware, service)
router.post('/login', (req, res, next) => logger.loggerTransactions(req, res, next, 'login'), user.login);

module.exports = router;