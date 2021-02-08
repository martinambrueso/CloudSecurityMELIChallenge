const express = require('express');
const ipcollector = require('../services/ipcollector')
const router = express.Router();
const ensurer = require('../middlewares/middlewares')
const logger = require('../middlewares/logger')

// GET ALL ips @params(route, loggerMiddleware, authenticationMiddleware, service)
router.get('/getAllIps', (req, res, next) => logger.loggerTransactions(req, res, next, 'getAllIps'), ensurer.isAuthenticated, ipcollector.getAllIPCollector); 
// PARA ESTE ENDPOINT SOLO TIENE QUE ESTAR AUTENTICADO

// GET a ip @params(route, loggerMiddleware, authenticationMiddleware, service)
router.get('/getWithoutWhiteList', (req, res, next) => logger.loggerTransactions(req, res, next, 'getWithoutWhiteList'), ensurer.isAuthenticated, ipcollector.getWithoutWhiteList); 
// PARA ESTE ENDPOINT SOLO TIENE QUE ESTAR AUTENTICADO

// DELETE a ip @params(route, loggerMiddleware, authenticationMiddleware, authorizeMiddleware, service)
router.delete('/removeIp', (req, res, next) => logger.loggerTransactions(req, res, next, 'removeIp'), ensurer.isAuthenticated, ensurer.isAuthorized, ipcollector.delete); 
// PARA ESTE ENDPOINT DEBE ESTAR AUTENTICADO Y AUTORIZADO COMO ADMIN

// INSERT a ip @params(route, loggerMiddleware, authenticationMiddleware, authorizeMiddleware, service)
router.post('/addIp', (req, res, next) => logger.loggerTransactions(req, res, next, 'addIp'), ensurer.isAuthenticated, ensurer.isAuthorized, ipcollector.create); 
// PARA ESTE ENDPOINT DEBE ESTAR AUTENTICADO Y AUTORIZADO COMO ADMIN

// REPLICATE FROM DATASOUERCES @params(route, loggerMiddleware, authenticationMiddleware, authorizeMiddleware, service)
router.post('/replicate', (req, res, next) => logger.loggerTransactions(req, res, next, 'replicate'), /*ensurer.isAuthenticated, ensurer.isAuthorized,*/ ipcollector.replicate); 
// PARA ESTE ENDPOINT DEBE ESTAR AUTENTICADO Y AUTORIZADO COMO ADMIN

//EXPORT ROUTER
module.exports = router;