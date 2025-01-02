const { saveVariableInflux, getVariables } = require('../services/VariableInfluxServices')

const saveVariable = async (req, res) => {
	try {
		const { name, unit, calc, varsInflux } = req.body

		if ((!name, !unit, !Boolean(calc), !varsInflux)) throw new Error('Faltan los datos del Diagrama')

		const Variable = await saveVariableInflux(req.body)

		return res.status(200).json(Variable)
	} catch (error) {
		console.error(error)
		if (error.errors) {
			res.status(500).json(error.errors)
		} else {
			res.status(400).json(error.message)
		}
	}
}
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

module.exports = {
	saveVariable,
	listVariables,
}
