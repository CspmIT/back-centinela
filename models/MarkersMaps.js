'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class MarkersMaps extends Model {
        static associate(models) {
            this.hasOne(models.PopUpsMarkers, {
                foreignKey: 'idMarker',
                as: 'PopUpsMarkers',
            })
        }
    }

    MarkersMaps.init(
        {
            name: DataTypes.STRING,
            latitude: DataTypes.DECIMAL(18, 15),
            longitude: DataTypes.DECIMAL(18, 15),
            idMap: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: 'MarkersMaps',
            tableName: 'MarkersMaps',
        }
    )
    return MarkersMaps
}
