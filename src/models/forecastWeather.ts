import { Model, DataTypes, Sequelize } from "sequelize";

class ForecastWeatherModel extends Model {
  public city!: string;
  public temp!: number | null;
  public sky!: number;
  public pty!: number;
  public rn1!: number | null;
  public reh!: number;
  public lgt!: number | null;
  public pop!: number | null;
  public tmx!: number | null;
  public tmn!: number | null;
  public hour!: string;
  public weather_date!: string;
}

export const ForecastWeatherInit = (sequelize: Sequelize): typeof ForecastWeatherModel => {
  ForecastWeatherModel.init(
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      temp: {
        type: DataTypes.FLOAT,
        allowNull: true,
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
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reh: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      lgt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pop: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tmx: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      tmn: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      hour: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      weather_date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: false,
      },
    },
    { sequelize, tableName: "forecastWeathers", updatedAt: false },
  );

  return ForecastWeatherModel;
};
