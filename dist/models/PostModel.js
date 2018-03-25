"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (Sequelize, DataTypes) => {
    //  Model for the graphql of our Blog post data type
    const Post = Sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: false,
        }
    }, {
        tableName: 'posts'
    });
    // 
    Post.associate = (models) => {
        // creating the relationship with the data
        Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'author',
                name: 'author'
            }
        });
    };
    return Post;
};
