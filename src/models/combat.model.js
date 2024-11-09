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
                values: ['waiting', 'started', 'finished']
            },
            roundCourant: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
            }
        },
        {
            timestamp: true,
        }
    );
};