'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class Diagram extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasMany(models.DiagramImage, { foreignKey: 'id_diagram', as: 'images' })
			this.hasMany(models.DiagramLine, { foreignKey: 'id_diagram', as: 'lines' })
			this.hasMany(models.DiagramText, { foreignKey: 'id_diagram', as: 'texts' })
			this.hasMany(models.DiagramPolyline, { foreignKey: 'id_diagram', as: 'polylines' })
		}
	}
	Diagram.init(
		{
			title: DataTypes.STRING,
			backgroundColor: DataTypes.STRING,
			backgroundImg: DataTypes.STRING,
			status: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: 'Diagram',
		}
	)
	return Diagram
}
