'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class DiagramText extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Diagram, { foreignKey: 'id_diagram', as: 'Diagram' })
		}
	}
	DiagramText.init(
		{
			id_diagram: DataTypes.INTEGER,
			name: DataTypes.STRING,
			left: DataTypes.INTEGER,
			top: DataTypes.INTEGER,
			angle: DataTypes.DECIMAL(5, 2),
			status: DataTypes.BOOLEAN,
			text: DataTypes.STRING,
			sizeText: DataTypes.INTEGER,
			colorText: DataTypes.STRING,
			backgroundText: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'DiagramText',
		}
	)
	return DiagramText
}
