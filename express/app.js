var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');

const { sep } = require('path');

var mariadb = require("." + sep + "MariaDB.js");
const { getLoginRes } = require("." + sep + "LoginRes.js");

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

    const paramID = req.body.id || req.query.id;
    const pw = req.body.password || req.query.password;

    mariadb.login(paramID, pw).then(function(result) {
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

// 모듈 로드 실패
if (mariadb == null) {
    console.log("The module 'MariaDB' is not loaded.");
    console.log("Exit...");
    return;
}

http.createServer(app).listen(app.get('port'), app.get('host'), () => {
    console.log('Express server running at ' + app.get('port') + " " + app.get('host'))
});