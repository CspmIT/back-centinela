'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class DiagramLine extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Diagram, { foreignKey: 'id_diagram', as: 'Diagram' })
			this.belongsTo(models.InfluxVar, { foreignKey: 'id_influxvars', as: 'variable' })
		}
	}
	DiagramLine.init(
		{
			id_diagram: DataTypes.INTEGER,
			id_influxvars: DataTypes.INTEGER,
			points: DataTypes.JSON,
			stroke: DataTypes.STRING,
			strokeWidth: DataTypes.INTEGER,
			dobleLine: DataTypes.BOOLEAN,
			colorSecondary: DataTypes.STRING,
			animation: DataTypes.BOOLEAN,
			invertAnimation: DataTypes.BOOLEAN,
			status: DataTypes.BOOLEAN,
			showText: DataTypes.BOOLEAN,
			text: DataTypes.STRING,
			sizeText: DataTypes.INTEGER,
			colorText: DataTypes.STRING,
			backgroundText: DataTypes.STRING,
			locationText: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'DiagramLine',
		}
	)
	return DiagramLine
}
