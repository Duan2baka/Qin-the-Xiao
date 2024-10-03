// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

var sqlinfo = require('./userinfo.json');
var mysql = require('mysql');

const SQLpool = mysql.createPool({
    host: sqlinfo.host,
    user: sqlinfo.user,
    password: sqlinfo.password,
    database: sqlinfo.database
});


console.log("Connected to SQL server successfully!");

exports = { SQLpool };
/*
SQLpool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log(results[0].solution)
})*/

/*
export async function SQLquery(querystr){
    try {
        var results = await pool.query(querystr);
        console.log(results)
        return results;
    }
    catch (err) {
        throw err;
    }
}*/
