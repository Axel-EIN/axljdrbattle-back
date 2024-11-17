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
      stance: {
        type:   DataTypes.ENUM,
        values: ['dodge', 'defense', 'concentration', 'attack', 'assault'],
        defaultValue: 'attack',
      },
      is_played: {
        type:   DataTypes.BOOLEAN,
        defaultValue: false,
      },
      character_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'characters',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      battle_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'battles',
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
