module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "region",
    {
      city: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
};
