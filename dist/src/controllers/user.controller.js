"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserController", {
    enumerable: true,
    get: function() {
        return UserController;
    }
});
const _services = require("../services");
let UserController = class UserController {
    user = new _services.UserService();
    getUsers = async (req, res, next)=>{
        try {
            const findAllUsersData = await this.user.findAllUser();
            res.success(findAllUsersData);
        } catch (error) {
            next(error);
        }
    };
    createUser = async (req, res, next)=>{
        try {
            const userData = req.body;
            const createUserData = await this.user.createUser(userData);
            res.status(201).json({
                data: createUserData,
                message: 'created'
            });
        } catch (error) {
            next(error);
        }
    };
};

//# sourceMappingURL=user.controller.js.map