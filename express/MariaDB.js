var mysql = require('mysql');
var fs = require('fs');
const { sep } = require('path');

const jsonFile = fs.readFileSync('.' + sep + 'NetworkValue.json', 'utf-8');
const jsonData = JSON.parse(jsonFile);
const value = jsonData.RDS;

const _user = value.user;
const _endpoint = value.endpoint;
const _password = value.password;
const _database = value.database;
const _port = value.port;
const _memberTable = jsonData.TABLE.members;

var connection = mysql.createConnection({
    host: _endpoint,
    user: _user,
    password: _password,
    database: _database,
    port: _port
});

var login_try = function(account, password) {
    return new Promise(function(resolve, reject) {
        // reject 는 try-catch 문에서 사용
        const sql = `select * from ${_memberTable} where account_id='${account}';`;

        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            // 해당하는 id 없음 (= 결과 row가 하나도 없음)
            if (rows.length == 0) {
                console.log(`There is no such id: ${account} in server`);
                resolve(false);
            }
            else {
                resolve(password == rows[0].password);
            }
        }
    )}
    )
};

module.exports.login = async function(account, password) {
    var result = await login_try(account, password);
    return result;
}

module.exports.connection = connection;