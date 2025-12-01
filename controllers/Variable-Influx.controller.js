const {
    saveVariableInflux,
    getVariables,
    getVarById,
    handleStatusInfluxVar,
    saveBitsData
} = require('../services/VariableInfluxServices')

const { db } = require('../models')

const { isValidId } = require('../utils/isIntegerNumber')

const saveVariable = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { name, unit, calc, varsInflux, binary_compressed, bits } = req.body;
  
      if ((!name, !unit, !Boolean(calc), !varsInflux))
        throw new Error('Faltan los datos del Diagrama');
  
      const variableSaved = await saveVariableInflux({
        ...req.body,
        binary_compressed: Boolean(binary_compressed),
      });
  
      if (binary_compressed === true) {
        await saveBitsData(variableSaved.id, bits, { transaction: t });
      }
  
      await t.commit();
      return res.status(200).json(variableSaved);
    } catch (error) {
      await t.rollback();
      console.error(error);
      if (error.errors) {
        res.status(500).json(error.errors);
      } else {
        res.status(400).json(error.message);
      }
    }
  };

const listVariables = async (req, res) => {
    try {
        const listVars = await getVariables()
        return res.status(200).json(listVars)
    } catch (error) {
        console.error(error)
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}

const getVar = async (req, res) => {
    try {
        const { id = false } = req.params
        if (!id || !isValidId(id)) {
            throw new Error('El id no es valido')
        }
        const influxVar = await getVarById(id)
        return res.status(200).json(influxVar)
    } catch (error) {
        res.status(400).json(error.message)
    }
}

const deleteVar = async (req, res) => {
    try {
        const { id = false } = req.params

        if (!id || !isValidId(id)) {
            return res.status(400).json({ message: 'Id invalida' })
        }

        const influxVar = await handleStatusInfluxVar(id)
        if (!influxVar) {
            return res
                .status(400)
                .json({ message: 'No se pudo cambiar el estado' })
        }

        return res.status(200).json({
            message: 'Estado actualizado con exito.',
            influxVar: influxVar,
        })
    } catch (error) {
        return res.status(500).json({ message: 'error' })
    }
}

module.exports = {
    saveVariable,
    listVariables,
    getVar,
    deleteVar,
}
