export default (sequelize, DataTypes) => {
    sequelize.define(
        'Character',
        {
            lastname: {
                type: DataTypes.STRING,
                allowNull: false
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'firstname_unique_index' // Nommage manuel pour éviter les duplications sur .sync({alter: true}
            },
            portrait: {
                type: DataTypes.STRING,
                allowNull: true
            },
            illustration: {
                type: DataTypes.STRING,
                allowNull: true
            },
            health: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 100,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                  model: 'users',
                  key: 'id',
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            }
        },
        {
            timestamps: false,
            indexes: [ // Nommage manuel pour éviter les duplications sur .sync({alter: true}
                { 
                    name: 'firstname_unique_index',
                    unique: true,
                    fields: ['firstname']
                }
            ],
        }
    );
};
