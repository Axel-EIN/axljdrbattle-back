export default (connection, DataTypes) => {
    connection.define(
        "Combat",
        {
            titre: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type:   DataTypes.ENUM,
                values: ['waiting', 'started', 'finished']
            }
        },
        {
            timestamp: true,
        }
    );
};