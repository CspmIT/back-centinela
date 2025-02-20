const routes = require('express').Router()
const { createMap } = require('../controllers/Map.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/map', verifyToken, createMap)
