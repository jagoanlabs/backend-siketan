'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class desa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.kecamatan, {
        foreignKey: 'kecamatanId'
      });
    }
  }
  desa.init(
    {
      nama: DataTypes.STRING,
      kecamatanId: DataTypes.INTEGER,
      type: DataTypes.ENUM('Desa', 'Kelurahan')
    },
    {
      sequelize,
      modelName: 'desa'
    }
  );
  return desa;
};
/**
 * Kecamatan → Desa
       * Relasi: Satu kecamatan memiliki banyak desa.
       * Penjelasan: Model kecamatan memiliki relasi hasMany ke model desa. Ini berarti setiap data kecamatan bisa terhubung dengan banyak
         data desa. Sebaliknya, setiap desa pasti memiliki satu kecamatan (belongsTo).
*/
