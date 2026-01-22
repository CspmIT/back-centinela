const { Op } = require('sequelize')
/**
 * Obtiene todos los usuarios activos de la base de datos.
 * Se consideran activos aquellos usuarios cuyo `status` sea igual a 1.
 *
 * @returns {Promise<Array<Object>>} Lista de usuarios activos.
 * @throws {Error} Si ocurre algún problema durante la consulta.
 * @author [José Romani] <jose.romani@hotmail.com>
 */
const getAllUser = async (db) => {
	try {
		const listUser = await db.User.findAll({ where: { status: 1 } })
		return listUser
	} catch (error) {
		throw error
	}
}

/**
 * Obtiene todos los usuarios activos junto con su relación de contraseñas de reconectadores.
 * Se incluyen aquellos usuarios cuyo `status` sea igual a 1 y que tengan una asociación con la entidad `passwordRecloser`.
 *
 * @returns {Promise<Array<Object>>} Lista de usuarios activos con la relación de contraseñas de reconectadores.
 * @throws {Error} Si ocurre algún problema durante la consulta o la inclusión de las asociaciones.
 * @author [José Romani] <jose.romani@hotmail.com>
 */
const getAllProfile = async (db) => {
	try {
		const listProfiles = await db.Profile.findAll()
		return listProfiles
	} catch (error) {
		throw error
	}
}

/**
 * Obtiene todos los usuarios activos junto con su relación de contraseñas de reconectadores.
 * Se incluyen aquellos usuarios cuyo `status` sea igual a 1 y que tengan una asociación con la entidad `passwordRecloser`.
 *
 * @returns {Promise<Array<Object>>} Lista de usuarios activos con la relación de contraseñas de reconectadores.
 * @throws {Error} Si ocurre algún problema durante la consulta o la inclusión de las asociaciones.
 * @author [José Romani] <jose.romani@hotmail.com>
 */
const getAllUserPass = async (db) => {
	try {
		const listUser = await db.User.findAll({
			where: { status: 1 },
		})
		return listUser
	} catch (error) {
		throw error
	}
}

module.exports = {
	getAllUser,
	getAllProfile,
	getAllUserPass,
}
