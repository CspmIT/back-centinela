/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('DiagramImageData', 'boolean_colors', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Colores personalizados para variables booleanas (false/true)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('DiagramImageData', 'boolean_colors');
  }
};
