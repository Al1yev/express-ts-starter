"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserModel", {
    enumerable: true,
    get: function() {
        return UserModel;
    }
});
const _mongoose = require("mongoose");
const UserSchema = new _mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
const UserModel = (0, _mongoose.model)('User', UserSchema);

//# sourceMappingURL=user.model.js.map