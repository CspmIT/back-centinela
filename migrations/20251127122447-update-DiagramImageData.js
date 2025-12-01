/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('DiagramImageData', 'id_bit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'id de la tabla VarsBinaryCompressedData'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('DiagramImageData', 'id_bit');
  }
};
