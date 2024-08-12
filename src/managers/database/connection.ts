import mysql from 'mysql2';

var db = mysql.createConnection({
    host: process.env.HOST!,
    user: process.env.USER!,
    password: process.env.PASSWORD!,
    database: process.env.DATABASE!,
    // host: process.env.HOST,  
});

db.connect((err) => {
    if(err) throw err;
    console.log('[DB] Connected.');
})

export default db;

import './userAutoRegistration';
import './manager';
