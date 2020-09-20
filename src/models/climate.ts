import { Model, DataTypes, Sequelize } from "sequelize";

class ClimateModel extends Model {
  public city!: string;
  public temp!: number | null;
  public max_temp!: number | null;
  public min_tamp!: number | null;
  public rn1!: number | null;
  public reh!: number | null;
  public year!: number;
}

export const ClimateInit = (sequelize: Sequelize): typeof ClimateModel => {
  ClimateModel.init(
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
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "climates",
      updatedAt: false,
      indexes: [
        {
          name: "climate_city_year",
          unique: true,
          fields: ["city", "year"],
        },
      ],
    },
  );

  return ClimateModel;
};
