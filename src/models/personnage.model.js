export default (sequelize, DataTypes) => {
    sequelize.define(
        'Personnage',
        {
            nom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            prenom: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'prenom_unique_index',
            },
            illustration: {
                type: DataTypes.STRING,
                allowNull: true
            },
            portrait: {
                type: DataTypes.STRING,
                allowNull: true
            },
            HP: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 100,
            }
        },
        {
            timestamps: false,
            indexes: [
                { 
                    name: 'prenom_unique_index',
                    unique: true,
                    fields: ['prenom']
                }
            ],
        }
    );
};