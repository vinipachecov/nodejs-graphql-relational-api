"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = require("bcryptjs");
exports.default = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }
    }, {
        tableName: 'users',
        hooks: {
            beforeCreate: (user, options) => {
                //encode the user password
                const salt = bcryptjs_1.genSaltSync();
                // mix the user password with the random value generated with saltSync
                user.password = bcryptjs_1.hashSync(user.password, salt);
            },
            beforeUpdate: (user, options) => {
                if (user.changed(`password`)) {
                    const salt = bcryptjs_1.genSaltSync();
                    user.password = bcryptjs_1.hashSync(user.password, salt);
                }
            }
        }
    });
    User.associate = (models) => { };
    User.prototype.isPassword = (encodedPassword, password) => {
        // compare the generated password and the given password to check if they match
        return bcryptjs_1.compareSync(password, encodedPassword);
    };
    return User;
};
