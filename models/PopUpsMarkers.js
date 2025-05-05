'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class PopUpsMarkers extends Model {
        static associate(models) {
            this.belongsTo(models.InfluxVar, {
                foreignKey: 'idVar',
                as: 'InfluxVar',
            })
        }
    }

    PopUpsMarkers.init(
        {
            lat: DataTypes.DECIMAL(18, 15),
            lng: DataTypes.DECIMAL(18, 15),
            idVar: DataTypes.INTEGER,
            idMarker: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'PopUpsMarkers',
            tableName: 'PopUpsMarkers',
            timestamps: false,
        }
    )
    return PopUpsMarkers
}
