module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "airpollution",
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      pm10: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      pm25: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      air_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
};
