'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class DiagramImage extends Model {
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
	DiagramImage.init(
		{
			id_diagram: DataTypes.INTEGER,
			name: DataTypes.STRING,
			src: DataTypes.STRING,
			left: DataTypes.INTEGER,
			top: DataTypes.INTEGER,
			angle: DataTypes.DECIMAL(5, 2),
			width: DataTypes.DECIMAL(5, 2),
			height: DataTypes.DECIMAL(5, 2),
			status: DataTypes.BOOLEAN,
			statusText: DataTypes.BOOLEAN,
			text: DataTypes.STRING,
			sizeText: DataTypes.INTEGER,
			colorText: DataTypes.STRING,
			backgroundText: DataTypes.STRING,
			textPosition: DataTypes.STRING,
			animation: DataTypes.BOOLEAN,
			statusTopic: DataTypes.BOOLEAN,
			topic: DataTypes.STRING,
			showValue: DataTypes.BOOLEAN,
			valuePosition: DataTypes.STRING,
			sizeTextValue: DataTypes.INTEGER,
			colorTextValue: DataTypes.STRING,
			backgroundTextValue: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'DiagramImage',
		}
	)
	return DiagramImage
}
