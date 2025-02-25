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
        await queryInterface.createTable('PopUpsMarkers', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            lat: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            lng: {
                type: Sequelize.DECIMAL(18, 15),
                allowNull: false,
            },
            idVar: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'InfluxVars',
                    key: 'id',
                },
            },
            idMarker: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'MarkersMaps',
                    key: 'id',
                },
            },
        })
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    },
}
