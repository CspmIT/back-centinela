const routes = require('express').Router()
const create = require('../controllers/Bombs.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/bombs', verifyToken, create)

module.exports = routes
