module.exports.CODE = {
    ERROR : -1,
    FALSE : 0,
    TRUE : 1
}

module.exports.MESSAGE = {
    NO_RESULT: "There is no result by query",
    ERROR: "An error occured when executing a query",
    GOOD: "Good",
    UNAVAILABLE: "Unavailable",
    ALREADY_LOGOUT: "This id is already in logout-status"
}

Object.freeze(this.CODE); // 값 변경 안되도록 설정
Object.freeze(this.MESSAGE);