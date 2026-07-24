"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = void 0;
var env_1 = __importDefault(require("./env"));
var registerPlugins = function (on, config) {
    (0, env_1.default)(on, config);
};
exports.registerPlugins = registerPlugins;
