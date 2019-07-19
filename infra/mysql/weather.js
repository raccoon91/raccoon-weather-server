module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "weather",
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: { model: "regions", key: "city" }
      },
      temp: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      yesterday_temp: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      sky: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pty: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pop: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      humidity: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      hour: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      weather_date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: false
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
