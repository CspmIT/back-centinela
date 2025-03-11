const routes = require('express').Router()
const {
    createMap,
    getMapById,
    getMaps,
    editMap,
} = require('../controllers/Map.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/map', verifyToken, createMap)
routes.post('/map/:id', verifyToken, editMap)
routes.get('/map', verifyToken, getMapById)
routes.get('/maps', verifyToken, getMaps)

module.exports = routes
