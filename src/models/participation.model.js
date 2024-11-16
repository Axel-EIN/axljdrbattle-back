export default (connection, DataTypes) => {
  connection.define(
    "Participation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      team: {
        type: DataTypes.TINYINT
      },
      initiative: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
      posture: {
        type:   DataTypes.ENUM,
        values: ['esquive', 'defense', 'centre', 'attaque', 'assaut'],
        defaultValue: 'attaque',
      },
      is_played: {
        type:   DataTypes.BOOLEAN,
        defaultValue: false,
      },
      personnage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'personnages',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      combat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'combats',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    },
    {
      timestamps: false,
    }
  );
};
