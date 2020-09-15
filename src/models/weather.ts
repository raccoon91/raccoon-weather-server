import { Model, DataTypes, Sequelize } from "sequelize";

class WeatherModel extends Model {
  public city!: string;
  public temp!: number;
  public max_temp!: number;
  public min_tamp!: number;
  public sky!: number;
  public pty!: number;
  public rn1!: number;
  public humidity!: number;
  public weather_date!: string;
}

export const WeatherInit = (sequelize: Sequelize): typeof WeatherModel => {
  WeatherModel.init(
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      temp: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      max_temp: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      min_temp: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      sky: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rn1: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      humidity: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      weather_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: false,
      },
    },
    { sequelize, tableName: "weathers", updatedAt: false },
  );

  return WeatherModel;
};
