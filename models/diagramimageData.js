'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class DiagramImageData extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.DiagramImage, { foreignKey: 'id_image', as: 'image' })
			this.belongsTo(models.InfluxVar, { foreignKey: 'id_influxvars', as: 'variable' })
		}
	}
	DiagramImageData.init(
		{
			id_image: DataTypes.INTEGER,
			id_influxvars: DataTypes.INTEGER,
			name_var: DataTypes.STRING,
			show_var: DataTypes.BOOLEAN,
			status: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: 'DiagramImageData',
		}
	)
	return DiagramImageData
}
