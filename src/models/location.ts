import { Model, DataTypes, Sequelize } from "sequelize";

class LocationModel extends Model {
  public ip!: string;
  public city!: string;
  public r1!: string;
  public r2!: string | null;
  public r3!: string | null;
}

export const LocationInit = (sequelize: Sequelize): typeof LocationModel => {
  LocationModel.init(
    {
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      r1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      r2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      r3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "locations",
      updatedAt: false,
      indexes: [
        {
          name: "location",
          unique: true,
          fields: ["ip"],
        },
      ],
    },
  );

  return LocationModel;
};
