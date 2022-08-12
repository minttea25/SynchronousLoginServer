var mysql = require('mysql');
var fs = require('fs');
const { sep } = require('path');

const myRes = require("." + sep + "LoginRes.js");

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

const { CODE } = require("." + sep + "Enums.js");
const { MESSAGE } = require("." + sep + "Enums.js");

var connection = mysql.createConnection({
    host: _endpoint,
    user: _user,
    password: _password,
    database: _database,
    port: _port
});

// return value: { code: code, message: message, id: id, level: level, name: name, image: image }
var login_try = function(id, password) {
    return new Promise(function(resolve, reject) {
        // reject 는 try-catch 문에서 사용
        const sql = `select * from ${_memberTable} where ${c_id}='${id}';`;
        var name, image, level, uid;

        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err);
                resolve(myRes.getLoginRes(CODE.ERROR, MESSAGE.ERROR, null, null, null, null, null));
            }
            // 해당하는 id 없음 (= 결과 row가 하나도 없음)
            if (rows.length == 0) {
                console.log(`There is no such id: ${id} in server`);
                resolve(myRes.getLoginRes(CODE.FALSE, MESSAGE.NO_RESULT, null, null, null, null, null));
            }
            else {
                uid = rows[0].uid;
                name = rows[0].mem_name;
                level = rows[0].mem_level;
                image = rows[0].mem_profile;

                if (password == rows[0].mem_password) {
                    // 로그인 상태로 변경
                    const sql2 = `update ${_memberTable} set ${c_loginstatus}=1 where ${c_id}='${id}';`;
                    connection.query(sql2, function(err, results) {
                        if (err) {
                            console.log(err);
                            resolve(myRes.getLoginRes(CODE.ERROR, MESSAGE.ERROR, null, null, null, null, null));
                        }
                        else {
                            resolve(myRes.getLoginRes(CODE.TRUE, MESSAGE.GOOD, uid, id, level, name, image));
                        }
                    })
                }
                else {
                    // 비밀 번호가 틀려도 '아이디나 비밀번호'가 틀린 것처럼 전송
                    resolve(myRes.getLoginRes(CODE.FALSE, MESSAGE.NO_RESULT, null, null, null, null));
                }
            }
        })
    })
};


// return value: { code: code, message: message }
// cf: result : OkPacket { fieldCount, affectedRows, insertId, serverStatus, warningCount, message, protocol41, changedRows }
var logout_try = function(id) {
    return new Promise(function(resolve, reject) {
        const sql = `update ${_memberTable} set ${c_loginstatus}=0 where ${c_id}='${id}';`;

        connection.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                resolve(myRes.getLogoutRes(CODE.ERROR, MESSAGE.ERROR));
            }
            // id가 없는 경우
            else if (result.affectedRows == 0) {
                resolve(myRes.getLogoutRes(CODE.ERROR, MESSAGE.NO_RESULT));
            }
            // 이미 로그아웃 되있는 경우
            else if (result.changedRows != 1) {
                resolve(myRes.getLogoutRes(CODE.FALSE, MESSAGE.ALREADY_LOGOUT));
            }
            else {
                resolve(myRes.getLogoutRes(CODE.TRUE, MESSAGE.GOOD));
            }
        })
    })
}

// return value: { code: code, message: message, uid: uid }
var join_try = function(account, password, nickname) {
    return new Promise(function(resolve, reject) {
        const sql = `insert into ${_memberTable} (${c_id}, ${c_password}, ${c_name}, ${c_lastlogin}, ${c_jointime}, ${c_pwchange}) 
        values ('${account}', '${password}', '${nickname}', now(), now(), now());`;

        connection.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                resolve(myRes.getJoinRes(CODE.ERROR, MESSAGE.ERROR, null));
            }
            else {
                // 가입 성공
                // uid 정보 가져오기
                const sql2 = `select ${c_uid} from ${_memberTable} where ${c_id}='${account}';`;
                connection.query(sql2, function(err, rows, fields) {
                    if(err || rows.length != 1) {
                        console.log(err);
                        resolve(myRes.getJoinRes(CODE.ERROR, MESSAGE.ERROR, null));
                    }
                    else {
                        resolve(myRes.getJoinRes(CODE.TRUE, MESSAGE.GOOD, rows[0].uid));
                    }
                })
            }
        })
    })
}


// return value: { code: code, message: message }
var check_id_try = function(id) {
    return new Promise(function(resolve, reject) {
        const sql = `select * from ${_memberTable} where ${c_id}='${id}';`;

        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err);
                resolve(myRes.getCheckIdRes(CODE.ERROR, MESSAGE.ERROR));
            }
            else if (rows.length == 0) {
                resolve(myRes.getCheckIdRes(CODE.TRUE, MESSAGE.GOOD));
            }
            // 아이디 중복
            else {
                resolve(myRes.getCheckIdRes(CODE.FALSE, MESSAGE.UNAVAILABLE));
            }
        })
    })
}

// return value: { code: code, message: message }
var check_name_try = function(name) {
    return new Promise(function(resolve, reject) {
        const sql = `select * from ${_memberTable} where ${c_name}='${name}';`;

        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err);
                resolve(myRes.getCheckNameRes(CODE.ERROR, MESSAGE.ERROR));
            }
            else if (rows.length == 0) {
                resolve(myRes.getCheckNameRes(CODE.TRUE, MESSAGE.GOOD));
            }
            // 아이디 중복
            else {
                resolve(myRes.getCheckNameRes(CODE.FALSE, MESSAGE.UNAVAILABLE));
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

module.exports.checkName = async function(name) {
    var result = await check_name_try(name);
    return result;
}

module.exports.connection = connection;

