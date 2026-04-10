'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class ChartProfile extends Model {
        static associate(models) {
            this.belongsTo(models.Chart, { foreignKey: 'chart_id', as: 'Chart' })
            this.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'Profile' })
        }
    }

    ChartProfile.init(
        {
            chart_id: DataTypes.INTEGER,
            profile_id: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'ChartProfile',
        }
    )
    return ChartProfile
}