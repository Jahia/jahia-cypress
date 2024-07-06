"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.registerPlugins = void 0;
var env_1 = __importDefault(require("./env"));
var registerPlugins = function (on, config) {
    env_1["default"](on, config);
};
exports.registerPlugins = registerPlugins;
