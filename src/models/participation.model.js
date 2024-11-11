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
      isPlayed: {
        type:   DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamp: true,
    }
  );
};
