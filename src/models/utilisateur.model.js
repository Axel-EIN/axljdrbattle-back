export default (connection, DataTypes) => {
    connection.define(
        "Utilisateur",
        {
            identifiant: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mdp: {
                type: DataTypes.STRING,
                allowNull: false
            },
            prenom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            avatar: {
                type: DataTypes.STRING
            },
            role: {
                type:   DataTypes.ENUM,
                values: ['user', 'mj', 'admin']
            }
        },
        {
            timestamp: true,
        }
    );
};