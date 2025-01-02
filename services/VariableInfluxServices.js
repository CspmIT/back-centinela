const { db } = require('../models')

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
const saveVariableInflux = async (data) => {
	const transaction = await db.sequelize.transaction()
	try {
		const [InfluxVar, created] = await db.InfluxVar.findOrCreate({
			where: { id: data?.id || 0 },
			defaults: { ...data },
			transaction,
		})
		if (!created) {
			await InfluxVar.update(data, { transaction })
		}
		await transaction.commit()
		return InfluxVar
	} catch (error) {
		await transaction.rollback()
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
const getVariables = async () => {
	try {
		const list = await db.InfluxVar.findAll({ where: { status: 1 } })
		return list
	} catch (error) {
		await transaction.rollback()
		throw error
	}
}

module.exports = {
	saveVariableInflux,
	getVariables,
}
