
// 로그인 관련 request 에대한 response json 데이터 형식
module.exports.getLoginRes = function(code, message) {
    return { code: code, message: message };
}