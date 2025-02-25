const routes = require('express').Router()
const { createMap, getMapById } = require('../controllers/Map.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/map', verifyToken, createMap)
routes.get('/map', verifyToken, getMapById)

module.exports = routes
