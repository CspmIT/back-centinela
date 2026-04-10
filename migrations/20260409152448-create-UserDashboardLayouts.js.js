'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserDashboardLayouts', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            chart_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Charts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            x: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            y: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            w: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 4,
            },
            h: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 3,
            },
            visible: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            config: {
                type: Sequelize.JSON,
                allowNull: true,
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

        queryInterface.sequelize.addHook('beforeCreate', (instance) => {
            instance.createdAt = new Date()
            instance.updatedAt = new Date()
        })

        queryInterface.sequelize.addHook('beforeUpdate', (instance) => {
            instance.updatedAt = new Date()
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UserDashboardLayouts')
    },
}