import { Model, DataTypes, Sequelize } from "sequelize";

class WeatherModel extends Model {
  public city!: string;
  public temp!: number | null;
  public max_temp!: number | null;
  public min_tamp!: number | null;
  public rn1!: number | null;
  public reh!: number | null;
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
        allowNull: true,
      },
      max_temp: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      min_temp: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      rn1: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      reh: {
        type: DataTypes.FLOAT,
        allowNull: true,
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
