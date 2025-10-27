const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/Auth.middleware')
const { 
    waterAverageTax,
    getGrafDifMenOsmosis 
} = require('../controllers/ExternalUsers.controller')

router.get('/average-tax', verifyToken, waterAverageTax)
router.get('/graf_dif_men_osmosis', verifyToken, getGrafDifMenOsmosis)

module.exports = router
