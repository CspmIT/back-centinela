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
        await queryInterface.createTable('PointsPLC', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            startPoint: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            endPoint: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            plcId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'PLCProfile',
                    key: 'id',
                },
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
        await queryInterface.dropTable('PointsPLC')
    },
}
