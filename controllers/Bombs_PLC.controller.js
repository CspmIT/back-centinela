const {
  getBombs_PLC,
  getData_Bombeo,
  postBombs_PLC,
  executeBombAction
} = require('../services/Bombs_PLCService')
const { db } = require('../models')


const listBombsPLC = async (req, res) => {
  const { influx_name = false } = req.user
  try {
    if (!influx_name) {
      return res.status(401).json('Tenes que estar logeado para hacer esta consulta')
    }
    const BombsPLC = await getBombs_PLC(influx_name);
    return res.status(200).json(BombsPLC)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const getBombeoStatus = async (req, res) => {
  const { influx_name = false } = req.user
  try {
    if (!influx_name) {
      return res.status(401).json('Tenes que estar logeado para hacer esta consulta')
    }

    const data_bombeo = await getData_Bombeo(influx_name)
    return res.status(200).json(data_bombeo)

  } catch (error) {
    console.error('getBombeoStatus:', error)
    if (error.errors) {
      return res.status(500).json(error.errors)
    }
    return res.status(400).json(error.message || 'Error inesperado')
  }
}


const addBombs_PLC = async (req, res) => {
  try {
    const newBomb_PLC = await postBombs_PLC(req.body);
    return res.status(200).json(newBomb_PLC)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const executeBomb = async (req, res) => {
  try {
    const { bombId, actionId } = req.body
    const userId = req.user.id

    const result = await executeBombAction({
      bombId,
      actionId,
      userId
    })
    return res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};


module.exports = {
  listBombsPLC,
  getBombeoStatus,
  addBombs_PLC,
  executeBomb,
  
}
