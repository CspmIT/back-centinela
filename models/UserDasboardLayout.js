'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class UserDashboardLayout extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'User',
            })

            this.belongsTo(models.Chart, {
                foreignKey: 'chart_id',
                as: 'Chart',
            })
        }
    }

    UserDashboardLayout.init(
        {
            user_id: DataTypes.INTEGER,
            chart_id: DataTypes.INTEGER,
            x: DataTypes.INTEGER,
            y: DataTypes.INTEGER,
            w: DataTypes.INTEGER,
            h: DataTypes.INTEGER,
            visible: DataTypes.BOOLEAN,
            config: DataTypes.JSON,
        },
        {
            sequelize,
            modelName: 'UserDashboardLayout',
        }
    )

    return UserDashboardLayout
}