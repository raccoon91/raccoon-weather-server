module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "airpollution",
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: { model: "regions", key: "city" }
      },
      pm10: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      pm25: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      pm10_tomorrow: {
        type: DataTypes.STRING(5),
        allowNull: true
      },
      pm25_tomorrow: {
        type: DataTypes.STRING(5),
        allowNull: true
      },
      air_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
};