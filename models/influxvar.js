'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class InfluxVar extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	InfluxVar.init(
		{
			name: DataTypes.STRING,
			unit: DataTypes.STRING,
			type: DataTypes.STRING,
			calc: DataTypes.BOOLEAN,
			varsInflux: DataTypes.JSON,
			equation: DataTypes.JSON,
			status: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: 'InfluxVar',
		}
	)
	return InfluxVar
}
