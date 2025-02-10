const {
    saveImageDiagram,
    saveLineDiagram,
    savePolylineDiagram,
    saveTextDiagram,
    saveInfoDiagram,
    listDiagram,
    ObjectsDiagram,
    saveImageData,
} = require('../services/DiagramService')

const { db } = require('../models')

const saveDiagram = async (req, res) => {
    let transaction
    try {
        transaction = await db.sequelize.transaction()

        const {
            diagram,
            images = [],
            lines = [],
            polylines = [],
            texts = [],
        } = req.body

        if (!diagram) throw new Error('Faltan los datos del Diagrama')

        const diagramDb = await saveInfoDiagram(diagram, transaction)

        if (images.length) {
            await Promise.all(
                images.map(async (image) => {
                    const img = await saveImageDiagram(
                        image,
                        transaction,
                        diagramDb.id
                    )
                    // Guardar variables asociadas a la imagen
                    const variables = Object.keys(image.variables).map(
                        (nameVar) => ({
                            id_image: img.id,
                            id_influxvars: image.variables[nameVar].id_variable,
                            name_var: nameVar,
                            show_var: image.variables[nameVar].show,
                        })
                    )
                    // Guardar todas las variables en paralelo
                    await Promise.all(
                        variables.map((variable) =>
                            saveImageData(variable, transaction)
                        )
                    )
                })
            )
        }

        // Procesar las líneas
        if (lines.length) {
            await Promise.all(
                lines.map((line) =>
                    saveLineDiagram(line, transaction, diagramDb.id)
                )
            )
        }

        // Procesar las polilíneas
        if (polylines.length) {
            await Promise.all(
                polylines.map((polyline) =>
                    savePolylineDiagram(polyline, transaction, diagramDb.id)
                )
            )
        }

        // Procesar los textos
        if (texts.length) {
            await Promise.all(
                texts.map((text) =>
                    saveTextDiagram(text, transaction, diagramDb.id)
                )
            )
        }

        await transaction.commit()
        return res.status(200).json(diagramDb)
    } catch (error) {
        console.error(error)

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
