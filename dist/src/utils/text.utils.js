"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "padBoth", {
    enumerable: true,
    get: function() {
        return padBoth;
    }
});
function padBoth(str, length, char = ' ') {
    const totalPadding = Math.max(length - str.length, 0);
    const startPadding = Math.floor(totalPadding / 2);
    const endPadding = totalPadding - startPadding;
    return str.padStart(str.length + startPadding, char).padEnd(length, char);
}

//# sourceMappingURL=text.utils.js.map