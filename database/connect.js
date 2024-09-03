import { createRequire } from "module";
const require = createRequire(import.meta.url);

var sqlinfo = require('./userinfo.json');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: sqlinfo.host,
  user: sqlinfo.user,
  password: sqlinfo.password
});

con.connect(function(err) {
  if (err) throw err;
  console.log("SQL server Connected!");
});