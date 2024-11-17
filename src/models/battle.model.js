export default (connection, DataTypes) => {
    connection.define(
        "Battle",
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type:   DataTypes.ENUM,
                values: ['waiting', 'started', 'finished', 'paused'],
                defaultValue: 'waiting',
            },
            current_round: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
            },
            current_turn_character_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                  model: 'characters',
                  key: 'id',
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            }
        },
        {
            timestamps: false,
        }
    );
};
