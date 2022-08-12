
// 로그인 관련 request에 대한 response json 데이터 형식
module.exports.getLoginRes = function(code, message, uid, id, level, name, image) {
    return { code: code, message: message, uid: uid, id: id, level: level, name: name, image: image };
}

// 로그아웃 관련 request에 대한 response json 데이터 형식
module.exports.getLogoutRes = function(code, message) {
    return { code: code, message: message };
}

// 회원가입 관련 request에 대한 response json 데이터 형식
module.exports.getJoinRes = function(code, message, uid) {
    return { code: code, message: message, uid: uid };
}

// 아이디 중복 확인 request 에 대한 response json 데이터 형식
module.exports.getCheckIdRes = function(code, message) {
    return { code: code, message: message };
}

// 이름(닉네임)중복 확인 request 에 대한 response json 데이터 형식
module.exports.getCheckNameRes = function(code, message) {
    return { code: code, message: message };
}