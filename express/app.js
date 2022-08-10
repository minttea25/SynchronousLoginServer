var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');

const { sep } = require('path');

var mariadb = require("." + sep + "MariaDB.js");

const { getLoginRes } = require("." + sep + "LoginRes.js");
const { getJoinRes } = require("." + sep + "LoginRes.js");
const { getCheckIdRes } = require("." + sep + "LoginRes.js");

const { RESOLVE_VALUE } = require("." + sep + "Enums.js");

const file = fs.readFileSync('.' + sep + 'NetworkValue.json', 'utf-8');
const jsonData = JSON.parse(file);
const ip = jsonData.HOST.ip;
const port = jsonData.HOST.port;

const app = express();

app.set("port", port);

// 미들웨어 등록
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded( {
        extended: false,
    })
);

// 브라우저 test 용
app.get("/test", (req, res) => {
    console.log("TEST");

    mariadb.login("test@test.com", "test").then(function(result) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
        res.write("<h2>sql: select * from Members</h2>");
        res.write(`[login test result] : ${result}`);
        res.end();
    });

    
})

app.post("/synchronous/login", (req, res) => {
    console.log("Login Request");

    const id = req.body.id || req.query.id;
    const pw = req.body.password || req.query.password;

    mariadb.login(id, pw).then(function(result) {
        // login failed
        if (!result) {
            res.send(getLoginRes(0, false));
        }
        // login success
        else {
            res.send(getLoginRes(0, true));
        }
    });
});

app.post("/synchronous/logout", (req, res) => {
    console.log("Logout Request");

    res.send(getLoginRes(0, "logout"));
})

app.post("/synchronous/join", (req, res) => {
    console.log("Join Request");

    const id = req.body.id || req.query.id;
    const pw = req.body.password || req.query.password;
    const name = req.body.name || req.query.name;

    mariadb.joinMember(id, pw, name).then(function(result) {
        // 가입 성공
        if (result != RESOLVE_VALUE.ERROR) {
            res.send(getJoinRes(0, true, result));
        }
        // 가입 실패
        else {
            res.send(getJoinRes(0, false, null));
        }
    });
});

app.post("/synchronous/checkid", (req, res) => {
    console.log("Id Check Request");

    const id = req.body.id || req.query.id;

    mariadb.checkId(id).then(function(result) {
        // 사용 가능 아이디
        if (result == RESOLVE_VALUE.TRUE) {
            res.send(getCheckIdRes(0, true));
        }
        // 아이디 중복
        else if (result == RESOLVE_VALUE.FALSE) {
            res.send(getCheckIdRes(0, false));
        }
    })
});


// 모듈 로드 실패
if (mariadb == null) {
    console.log("The module 'MariaDB' is not loaded.");
    console.log("Exit...");
    return;
}

http.createServer(app).listen(app.get('port'), app.get('host'), () => {
    console.log('Express server running at ' + app.get('port') + " " + app.get('host'))
});