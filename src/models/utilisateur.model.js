export default (connection, DataTypes) => {
    connection.define(
        "Utilisateur",
        {
            identifiant: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'identifiant_unique_index', // Nommage manuel index => évite duplication après Sequelize.sync({alter: true}
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
                values: ['user', 'mj', 'admin'],
                defaultValue: 'user'
            }
        },
        {
            timestamps: false,
            indexes: [
                { // Définition manuelle index => évite duplication après Sequelize.sync({alter: true})
                    name: 'identifiant_unique_index',
                    unique: true,
                    fields: ['identifiant']
                }
            ]
        }
    );
};