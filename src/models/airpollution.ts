import { Model, DataTypes, Sequelize } from "sequelize";

class AirPollutionModel extends Model {
  public city!: string;
  public pm10!: string;
  public pm25!: string;
  public air_date!: Date;
}

export const AirPollutionInit = (sequelize: Sequelize): typeof AirPollutionModel => {
  AirPollutionModel.init(
    {
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      pm10: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      pm25: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      air_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "airpollutions",
      indexes: [
        {
          name: "air_city_air_date",
          unique: true,
          fields: ["city", "air_date"],
        },
      ],
    },
  );

  return AirPollutionModel;
};
