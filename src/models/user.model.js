export default (connection, DataTypes) => {
    connection.define(
        "User",
        {
            login: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'login_unique_index' // Nommage manuel pour éviter les duplications sur .sync({alter: true}
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: 'email_unique_index' // Nommage manuel pour éviter les duplications sur .sync({alter: true}
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: false
            },
            avatar: {
                type: DataTypes.STRING
            },
            role: {
                type:   DataTypes.ENUM,
                values: ['user', 'gamemaster', 'admin'],
                defaultValue: 'user'
            },
            isVerify: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            }
        },
        {
            timestamps: false,
            indexes: [ // Nommage manuel pour éviter les duplications sur .sync({alter: true}
                { 
                    name: 'login_unique_index',
                    unique: true,
                    fields: ['login']
                },
                { 
                    name: 'email_unique_index',
                    unique: true,
                    fields: ['email']
                }
            ]
        }
    );
};
