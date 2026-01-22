const { getIdTable, getIdColumn, saveColumnUser, getColumnsUser } = require('../services/ConfigUserService')
const jwt = require('jsonwebtoken')
require('dotenv')
const secret = process.env.SECRET

const saveConfigTable = async (req, res) => {
	try {
		const { table, columns } = req.body
		if (!table || !columns) throw new Error('se deben pasar todo los campos (id_table y un array de las columnas)')
		const idTable = await getIdTable(table, req.db)
		const token = req.cookies.token
		const decoded = jwt.verify(token, secret)
		const arrayColumns = []
		for (const item of Object.keys(columns)) {
			const column = await getIdColumn(idTable.id, item, req.db)
			arrayColumns.push({ name: item, status: columns[item], id_user: decoded.sub, id_columnsTable: column.id })
		}

		await saveColumnUser(arrayColumns, req.db)
		return res.status(200).json(arrayColumns)
	} catch (error) {
		if (error.errors) {
			res.status(500).json(error.errors)
		} else {
			res.status(400).json(error.message)
		}
	}
}

const getColumnsUserTable = async (req, res) => {
	try {
		const { table_name, id_user } = req.body
		const idTable = await getIdTable(table_name, req.db)
		const column = await getColumnsUser(idTable.id, id_user, req.db)
		const result = column.map((item) => {
			return { name: item.columnsTable.name, status: item.status }
		})
		return res.status(200).json(result)
	} catch (error) {
		if (error.errors) {
			res.status(500).json(error.errors)
		} else {
			res.status(400).json(error.message)
		}
	}
}

module.exports = {
	saveConfigTable,
	getColumnsUserTable,
}
