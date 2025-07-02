"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserRouter", {
    enumerable: true,
    get: function() {
        return UserRouter;
    }
});
const _express = require("express");
const _controllers = require("../controllers");
const _middlewares = require("../middlewares");
const _dtos = require("../dtos");
let UserRouter = class UserRouter {
    path = '/users';
    router = (0, _express.Router)();
    user = new _controllers.UserController();
    constructor(){
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.user.getUsers);
        this.router.post(`${this.path}`, (0, _middlewares.ValidationMiddleware)(_dtos.CreateUserDto), this.user.createUser);
    }
};

//# sourceMappingURL=user.router.js.map