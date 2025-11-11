'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Logs_Cronjob extends Model {
		static associate(models) {
		}
	}

	Logs_Cronjob.init(
		{
			message: {
				type: DataTypes.JSON,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'Logs_Cronjob',
			tableName: 'Logs_Cronjob',
			timestamps: true,
		}
	)

	return Logs_Cronjob
}
