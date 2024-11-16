export default (connection, DataTypes) => {
    connection.define(
        "Combat",
        {
            titre: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            statut: {
                type:   DataTypes.ENUM,
                values: ['waiting', 'started', 'finished', 'paused'],
                defaultValue: 'waiting',
            },
            round_courant: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            timestamps: false,
        }
    );
};