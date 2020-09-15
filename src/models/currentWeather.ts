import { Model, DataTypes, Sequelize } from "sequelize";

class CurrentWeatherModel extends Model {
  public city!: string;
  public t1h!: number;
  public pty!: number;
  public rn1!: number;
  public reh!: number;
  public weather_date!: string;
}

export const CurrentWeatherInit = (sequelize: Sequelize): typeof CurrentWeatherModel => {
  CurrentWeatherModel.init(
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      temp: {
        type: DataTypes.FLOAT,
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
      reh: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      weather_date: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: false,
      },
    },
    { sequelize, tableName: "currentWeathers", updatedAt: false },
  );

  return CurrentWeatherModel;
};