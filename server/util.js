function getOrigin(req) {
    return req.protocol + '://' + req.headers.host

}

module.exports = {getOrigin}