import { Model, DataTypes, Sequelize } from "sequelize";

class ForecastModel extends Model {
  public city!: string;
  public temp!: number | null;
  public sky!: number | null;
  public pty!: number;
  public reh!: number;
  public pop!: number | null;
  public tmx!: number | null;
  public tmn!: number | null;
  public hour!: string;
  public weather_date!: string;
}

export const ForecastInit = (sequelize: Sequelize): typeof ForecastModel => {
  ForecastModel.init(
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
        allowNull: true,
      },
      pty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reh: {
        type: DataTypes.FLOAT,
        allowNull: false,
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
    {
      sequelize,
      tableName: "forecasts",
      indexes: [
        {
          name: "forecast_city_weather_date",
          unique: true,
          fields: ["city", "weather_date"],
        },
      ],
    },
  );

  return ForecastModel;
};