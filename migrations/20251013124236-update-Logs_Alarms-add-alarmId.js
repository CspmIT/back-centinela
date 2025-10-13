/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Logs_Alarms', 'alarmId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Alarms',     
        key: 'id',          
      }, 
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Logs_Alarms', 'alarmId')
  }
}
