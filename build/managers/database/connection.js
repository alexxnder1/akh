"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
var db = mysql2_1.default.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    // host: process.env.HOST,  
});
db.connect((err) => {
    if (err)
        throw err;
    console.log('[DB] Connected.');
});
exports.default = db;
require("./userAutoRegistration");
require("./user-cache");
