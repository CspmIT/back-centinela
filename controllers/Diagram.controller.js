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
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const {
      diagram,
      images = [],
      lines = [],
      polylines = [],
      texts = [],
      deleted = {}
    } = req.body;

    if (!diagram) throw new Error('Faltan los datos del Diagrama');

    const diagramDb = await saveInfoDiagram(diagram, transaction);

    if (deleted) {
      const {
        lines: deletedLines = [],
        texts: deletedTexts = [],
        images: deletedImages = [],
        polylines: deletedPolylines = [],
      } = deleted;

      await Promise.all([
        ...deletedLines.map((id) =>
          db.DiagramLine.update({ status: 0 }, { where: { id }, transaction })
        ),
        ...deletedTexts.map((id) =>
          db.DiagramText.update({ status: 0 }, { where: { id }, transaction })
        ),
        ...deletedImages.map((id) =>
          db.DiagramImage.update({ status: 0 }, { where: { id }, transaction })
        ),
        ...deletedPolylines.map((id) =>
          db.DiagramPolyline.update({ status: 0 }, { where: { id }, transaction })
        ),
      ]);
    }

    if (images.length) {
      await Promise.all(
        images.map(async (image) => {
          const img = await saveImageDiagram(image, transaction, diagramDb.id);

          await db.DiagramImageData.destroy({
            where: { id_image: img.id },
            transaction,
          });

          const variables = Object.keys(image.variables || {}).map((nameVar) => ({
            id_image: img.id,
            id_influxvars: image.variables[nameVar].id_variable,
            name_var: nameVar,
            show_var: image.variables[nameVar].show,
            position_var: image.variables[nameVar].position,
            status: true,
          }));

          await Promise.all(
            variables.map((variable) => saveImageData(variable, transaction))
          );
        })
      );
    }

    if (lines.length) {
      await Promise.all(
        lines.map((line) =>
          saveLineDiagram(line, transaction, diagramDb.id)
        )
      );
    }

    if (polylines.length) {
      await Promise.all(
        polylines.map((polyline) =>
          savePolylineDiagram(polyline, transaction, diagramDb.id)
        )
      );
    }

    if (texts.length) {
      await Promise.all(
        texts.map((text) =>
          saveTextDiagram(text, transaction, diagramDb.id)
        )
      );
    }

    await transaction.commit();
    return res.status(200).json(diagramDb);
  } catch (error) {
    console.error(error);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }

    if (error.errors) {
      res.status(500).json(error.errors);
    } else {
      res.status(400).json(error.message);
    }
  }
};


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

const changeStatusDiagram = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (typeof id === 'undefined' || typeof status === 'undefined') {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const diagram = await db.Diagram.findByPk(id);

    if (!diagram) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }

    diagram.status = status ? 0 : 1;
    await diagram.save();

    return res.status(200).json({ success: true, diagram });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al cambiar el estado del diagrama' });
  }
};


module.exports = {
  getDiagrams,
  saveDiagram,
  getObjectCanva,
  changeStatusDiagram
}
