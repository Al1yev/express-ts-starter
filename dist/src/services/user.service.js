"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserService", {
    enumerable: true,
    get: function() {
        return UserService;
    }
});
const _bcrypt = require("bcrypt");
const _exceptions = require("../exceptions");
const _models = require("../models");
let UserService = class UserService {
    async findAllUser() {
        const users = await _models.UserModel.find();
        return users;
    }
    async createUser(userData) {
        const findUser = await _models.UserModel.findOne({
            email: userData.email
        });
        if (findUser) throw new _exceptions.HttpException(409, `This email ${userData.email} already exists`);
        const hashedPassword = await (0, _bcrypt.hash)(userData.password, 10);
        const createUserData = await _models.UserModel.create({
            ...userData,
            password: hashedPassword
        });
        return createUserData;
    }
    async findUserById(userId) {
        const findUser = await _models.UserModel.findOne({
            _id: userId
        });
        if (!findUser) throw new _exceptions.HttpException(409, "User doesn't exist");
        return findUser;
    }
};

//# sourceMappingURL=user.service.js.map