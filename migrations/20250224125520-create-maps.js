'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('Maps', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            bearing: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            latitude: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            longitude: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            pitch: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            zoom: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })
        // Add hooks to handle created_at and updated_at
        queryInterface.sequelize.addHook('beforeCreate', (instance) => {
            instance.createdAt = new Date()
            instance.updatedAt = new Date()
        })

        queryInterface.sequelize.addHook('beforeUpdate', (instance) => {
            instance.updatedAt = new Date()
        })
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable('Maps')
    },
}
