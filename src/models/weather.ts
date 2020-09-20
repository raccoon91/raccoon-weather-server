import { Model, DataTypes, Sequelize } from "sequelize";

class WeatherModel extends Model {
  public city!: string;
  public t1h!: number;
  public pty!: number;
  public rn1!: number;
  public reh!: number;
  public weather_date!: string;
}

export const WeatherInit = (sequelize: Sequelize): typeof WeatherModel => {
  WeatherModel.init(
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      t1h: {
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
    {
      sequelize,
      tableName: "weathers",
      updatedAt: false,
      indexes: [
        {
          name: "weather_city_weather_date",
          unique: true,
          fields: ["city", "weather_date"],
        },
      ],
    },
  );

  return WeatherModel;
};
