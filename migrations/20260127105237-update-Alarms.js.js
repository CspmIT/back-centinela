'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Alarms', 'hasTimeRange', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        })

        await queryInterface.addColumn('Alarms', 'startime', {
            type: Sequelize.STRING(5),
            allowNull: true,
        })

        await queryInterface.addColumn('Alarms', 'endtime', {
            type: Sequelize.STRING(5), 
            allowNull: true,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Alarms', 'hasTimeRange')
        await queryInterface.removeColumn('Alarms', 'startime')
        await queryInterface.removeColumn('Alarms', 'endtime')
    },
}
