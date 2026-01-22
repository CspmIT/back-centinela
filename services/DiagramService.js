const listDiagram = async (db) => {
	try {
		const Diagram = await db.Diagram.findAll()
		return Diagram
	} catch (error) {
		throw error
	}
}

const ObjectsDiagram = async (id, db) => {
	try {
		const Diagram = await db.Diagram.findAll({
			where: { id: id },
			include: [
				{
					association: 'images',
					required: false,
					where: { status: 1 },
					include: [
						{
							association: 'variables',
							required: false,
							where: { status: 1 },
							include: [
								{
									association: 'variable',
									required: false,
									attributes: ['unit', 'type', 'calc', 'varsInflux', 'equation', 'status', 'binary_compressed'],
								},
								{
									association: 'bit',
									required: false,
									attributes: ['id', 'name', 'bit']
								}
							],
						},
					],
				},
				{
					association: 'lines',
					required: false,
					where: { status: 1 },
					include: [
						{
							association: 'variable',
							required: false,
							attributes: ['name', 'unit', 'type', 'calc', 'varsInflux', 'equation', 'status'],
						},
					],
				},
				{
					association: 'texts',
					required: false,
					where: { status: 1 },
					include: [
						{
							association: 'variable',
							required: false,
							attributes: ['name', 'unit', 'type', 'calc', 'varsInflux', 'equation', 'status'],
						},
					],
				},
				{
					association: 'polylines',
					required: false,
					where: { status: 1 },
					include: [
						{
							association: 'variable',
							required: false,
							attributes: ['name', 'unit', 'type', 'calc', 'varsInflux', 'equation', 'status'],
						},
					],
				},
			],
		})

		const normalizedDiagram = Diagram.map((d) => {
			const diagramObj = d.toJSON();

			diagramObj.images = diagramObj.images?.map((img) => {
				const variable = img.variables?.[0]?.variable;
				const bit = img.variables?.[0]?.bit;
				return {
					...img,
					dataInflux: variable
						? {
							id_variable: img.variables[0].id_influxvars,
							name: variable.name || img.variables[0].name_var,
							unit: variable.unit,
							type: variable.type,
							calc: variable.calc,
							varsInflux: variable.varsInflux,
							equation: variable.equation,
							status: variable.status,
							bit_name: bit?.name || null,
						}
						: null,
				};
			});

			return diagramObj;
		});

		return normalizedDiagram;


	} catch (error) {
		throw error
	}
}

/**
 * Guarda la informacion pertenecientes a un diagrama.
 *
 * @param {Object} diagram - Un objeto que representa el diagrama.
 * @param {string} diagram.id - El identificador único del diagrama.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la imagen guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const saveInfoDiagram = async (diagram, transaction, db) => {
	try {
		const [Diagram, created] = await db.Diagram.findOrCreate({
			where: { id: diagram?.id || 0 },
			defaults: { ...diagram },
			transaction,
		})
		if (!created) {
			await Diagram.update(diagram, { transaction })
		}
		return Diagram
	} catch (error) {
		throw error
	}
}

/**
 * Guarda las imágenes pertenecientes a un diagrama.
 *
 * @param {Object} image - Un objeto que representa la imagen del diagrama.
 * @param {string} image.id - El identificador único de la imagen.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la imagen guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const saveImageDiagram = async (image, transaction, id_diagram, db) => {
	try {
		// image.id = typeof image.id === 'string' ? 0 : image.id
		image.id_diagram = id_diagram
		const [DiagramImage, created] = await db.DiagramImage.findOrCreate({
			where: { id: image?.id || 0 },
			defaults: { ...image },
			transaction,
		})
		if (!created) {
			await DiagramImage.update(image, { transaction })
		}
		return DiagramImage
	} catch (error) {
		throw error
	}
}

/**
 * Guarda la relacion entre variable y imagen.
 *
 * @param {Object} variable - Un objeto que representa la relación entre la imagen y la variable.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la imagen guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const saveImageData = async (variable, transaction, db) => {
	try {
		const [DiagramImageData, created] = await db.DiagramImageData.findOrCreate({
			where: { id_image: variable.id_image, name_var: variable.name_var },
			defaults: { ...variable },
			transaction,
		})
		if (!created) {
			await DiagramImageData.update(variable, { transaction })
		}
		return DiagramImageData
	} catch (error) {
		throw error
	}
}

/**
 * Guarda las líneas pertenecientes a un diagrama.
 *
 * @param {Object} line - Un objeto que representa la línea del diagrama.
 * @param {string} line.id - El identificador único de la línea.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la línea guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const saveLineDiagram = async (line, transaction, id_diagram, db) => {
	try {
		line.id_diagram = id_diagram
		line.id_influxvars = line.id_influxvars === 0 ? null : line.id_influxvars
		const [DiagramLine, created] = await db.DiagramLine.findOrCreate({
			where: { id: line?.id || 0 },
			defaults: { ...line },
			transaction,
		})
		if (!created) {
			await DiagramLine.update(line, { transaction })
		}
		return DiagramLine
	} catch (error) {
		throw error
	}
}

/**
 * Guarda las polilíneas pertenecientes a un diagrama.
 *
 * @param {Object} polyline - Un objeto que representa la polilínea del diagrama.
 * @param {string} polyline.id - El identificador único de la polilínea.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la polilínea guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const savePolylineDiagram = async (polyline, transaction, id_diagram, db) => {
	try {
		// polyline.id = typeof polyline.id === 'string' ? 0 : polyline.id
		polyline.id_diagram = id_diagram
		polyline.id_influxvars = polyline.id_influxvars === 0 ? null : polyline.id_influxvars
		const [DiagramPolyline, created] = await db.DiagramPolyline.findOrCreate({
			where: { id: polyline?.id || 0 },
			defaults: { ...polyline },
			transaction,
		})
		if (!created) {
			await DiagramPolyline.update(polyline, { transaction })
		}
		return DiagramPolyline
	} catch (error) {
		throw error
	}
}

/**
 * Guarda los textos pertenecientes a un diagrama.
 *
 * @param {Object} text - Un objeto que representa el texto del diagrama.
 * @param {string} text.id - El identificador único del texto.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa el texto guardado o actualizado.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const saveTextDiagram = async (text, transaction, id_diagram, db) => {
	try {
		// text.id = typeof text.id === 'string' ? 0 : text.id
		text.id_diagram = id_diagram
		const [DiagramText, created] = await db.DiagramText.findOrCreate({
			where: { id: text?.id || 0 },
			defaults: { ...text },
			transaction,
		})
		if (!created) {
			await DiagramText.update(text, { transaction })
		}
		return DiagramText
	} catch (error) {
		throw error
	}
}

module.exports = {
	listDiagram,
	ObjectsDiagram,
	saveInfoDiagram,
	saveImageDiagram,
	saveImageData,
	saveLineDiagram,
	savePolylineDiagram,
	saveTextDiagram,
}
