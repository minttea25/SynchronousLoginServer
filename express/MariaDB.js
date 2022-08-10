var mysql = require('mysql');
var fs = require('fs');
const { sep } = require('path');

const jsonFile = fs.readFileSync('.' + sep + 'NetworkValue.json', 'utf-8');
const jsonData = JSON.parse(jsonFile);
const rds_v = jsonData.RDS;
const columns_v = jsonData.COLUMNS;

const _user = rds_v.user;
const _endpoint = rds_v.endpoint;
const _password = rds_v.password;
const _database = rds_v.database;
const _port = rds_v.port;
const _memberTable = jsonData.TABLE.member;
const c_uid = columns_v.uid;
const c_password = columns_v.password;
const c_name = columns_v.name;
const c_lastlogin = columns_v.lastlogin;
const c_jointime = columns_v.jointime;
const c_pwchange = columns_v.pwchange;
const c_loginstatus = columns_v.loginstatus;
const c_level = columns_v.level;
const c_id = columns_v.id;
const c_profile = columns_v.profile;

const { RESOLVE_VALUE } = require("." + sep + "Enums.js");

var connection = mysql.createConnection({
    host: _endpoint,
    user: _user,
    password: _password,
    database: _database,
    port: _port
});

var login_try = function(id, password) {
    return new Promise(function(resolve, reject) {
        // reject 는 try-catch 문에서 사용
        const sql = `select * from ${_memberTable} where ${c_id}='${id}';`;

        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err);
                resolve(RESOLVE_VALUE.ERROR);
            }
            // 해당하는 id 없음 (= 결과 row가 하나도 없음)
            if (rows.length == 0) {
                console.log(`There is no such id: ${id} in server`);
                resolve(RESOLVE_VALUE.FALSE);
            }
            else {
                if (password == rows[0].mem_password) {
                    // 로그인 상태로 변경
                    const sql2 = `update ${_memberTable} set ${c_loginstatus}=1 where ${c_id}='${id}';`;
                    connection.query(sql2, function(err, results) {
                        if (err) {
                            console.log(err);
                            resolve(RESOLVE_VALUE.ERROR);
                        }
                        else {
                            resolve(RESOLVE_VALUE.TRUE);
                        }
                    })
                }
                else {
                    resolve(RESOLVE_VALUE.FALSE);
                }
            }
        })
    })
};

var logout_try = function(id) {
    return new Promise(function(resolve, reject) {
        const sql = `update ${_memberTable} set ${c_loginstatus}=0 where ${c_id}='id';`;

        connection.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                resolve(RESOLVE_VALUE.ERROR);
            }
            else {
                resolve(RESOLVE_VALUE.TRUE);
            }
        })
    })
}

var join_try = function(account, password, nickname) {
    return new Promise(function(resolve, reject) {
        const sql = `insert into ${_memberTable} (${c_id}, ${c_password}, ${c_name}, ${c_lastlogin}, ${c_jointime}, ${c_pwchange}) 
        values ('${account}', '${password}', '${nickname}', now(), now(), now());`;

        connection.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                resolve(RESOLVE_VALUE.ERROR);
            }
            else {
                // 가입 성공
                // uid 정보 가져오기
                const sql2 = `select ${c_uid} from ${_memberTable} where ${c_id}='${account}';`;
                connection.query(sql2, function(err, rows, fields) {
                    if(err || rows.length != 1) {
                        console.log(err);
                        resolve(-1);
                    }
                    else {
                        resolve(rows[0].uid);
                    }
                })
            }
        })
    })
}


// return value
// 0: 중복 아이디 있음
// 1: 사용 가능 아이디
// -1: 에러 
var check_id_try = function(id) {
    return new Promise(function(resolve, reject) {
        const sql = `select * from ${_memberTable} where ${c_id}='${id}';`;

        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err); // 아이디 중복
                resolve(RESOLVE_VALUE.ERROR);
            }
            else if (rows.length == 0) {
                resolve(RESOLVE_VALUE.TRUE);
            }
            else {
                resolve(RESOLVE_VALUE.FALSE);
            }
        })
    })
}

module.exports.login = async function(id, password) {
    var result = await login_try(id, password);
    return result;
}

module.exports.logout = async function(id) {
    var result = await logout_try(id);
    return result;
}

module.exports.joinMember = async function(account, password, nickname) {
    var result = await join_try(account, password, nickname);
    return result;
}

module.exports.checkId = async function(id) {
    var result = await check_id_try(id);
    return result;
}

module.exports.connection = connection;

