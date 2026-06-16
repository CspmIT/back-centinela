'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ChartProfiles', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            chart_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Charts', key: 'id' },
                onDelete: 'CASCADE'
            },
            profile_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Profiles', key: 'id' },
                onDelete: 'CASCADE'
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        })

        // Índice único para evitar duplicados chart+perfil
        await queryInterface.addIndex('ChartProfiles', ['chart_id', 'profile_id'], {
            unique: true,
            name: 'unique_chart_profile'
        })
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('ChartProfiles')
    }
}