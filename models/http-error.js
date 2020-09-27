//Custome HttpError Model
class HttpError extends Error {
    constructor(message, erorrCode) {
        super(message);
        this.code = erorrCode;
    }
}

module.exports = HttpError;