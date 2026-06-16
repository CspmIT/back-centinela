'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class Profile extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsToMany(models.Chart, {
				through: models.ChartProfile,
				foreignKey: 'profile_id',
				as: 'Charts'
			})
		}
	}
	Profile.init(
		{
			description: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Profile',
		}
	)
	return Profile
}
