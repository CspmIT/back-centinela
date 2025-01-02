const {
	saveImageDiagram,
	saveLineDiagram,
	savePolylineDiagram,
	saveTextDiagram,
	saveInfoDiagram,
	listDiagram,
	ObjectsDiagram,
} = require('../services/DiagramService')
const { db } = require('../models')

const saveDiagram = async (req, res) => {
	let transaction
	try {
		transaction = await db.sequelize.transaction()

		const { diagram, images, lines, polylines, texts } = req.body

		if (!diagram) throw new Error('Faltan los datos del Diagrama')

		const diagramDb = await saveInfoDiagram(diagram, transaction)

		if (images.length) {
			for (const image of images) {
				await saveImageDiagram(image, transaction, diagramDb.id)
			}
		}
		if (lines.length) {
			for (const line of lines) {
				await saveLineDiagram(line, transaction, diagramDb.id)
			}
		}
		if (polylines.length) {
			for (const polyline of polylines) {
				await savePolylineDiagram(polyline, transaction, diagramDb.id)
			}
		}
		if (texts.length) {
			for (const text of texts) {
				await saveTextDiagram(text, transaction, diagramDb.id)
			}
		}

		await transaction.commit()
		return res.status(200).json(diagramDb)
	} catch (error) {
		console.log(error)
		if (transaction) {
			try {
				await transaction.rollback()
			} catch (rollbackError) {
				console.error('Error al hacer rollback:', rollbackError)
			}
		}

		if (error.errors) {
			res.status(500).json(error.errors)
		} else {
			res.status(400).json(error.message)
		}
	}
}

const getDiagrams = async (req, res) => {
	try {
		const listDiagras = await listDiagram()
		return res.status(200).json(listDiagras)
	} catch (error) {
		if (error.errors) {
			res.status(500).json(error.errors)
		} else {
			res.status(400).json(error.message)
		}
	}
}
const getObjectCanva = async (req, res) => {
	try {
		const { id } = req.query
		if (!id) throw new Error('Se debe pasar un ID')

		const listObject = await ObjectsDiagram(id)
		return res.status(200).json(listObject)
	} catch (error) {
		if (error.errors) {
			res.status(500).json(error.errors)
		} else {
			res.status(400).json(error.message)
		}
	}
}

module.exports = {
	getDiagrams,
	saveDiagram,
	getObjectCanva,
}
