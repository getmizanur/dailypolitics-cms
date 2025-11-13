const StringUtil = require('../../util/stringUtil');
const VarUtil = require('../../util/varUtil');


class Response {
    
    constructor(options = {}) {
        this.headers = {};
        this.httpResponseCode = 200;
        this.redirected = false;
        this.exceptions = {};
        this.sendHeaders = false;
    }

    _normalizeHeaders(name) {
        let filtered = StringUtil.strReplace('/-/_/gi', ' ', name);
        filtered = StringUtil.ucwords(StringUtil.strtolower(filtered));
	    filtered = StringUtil.strReplace(' ', '-', filtered);	

        return filtered;
    }

    setHeader(name, value, replace = true) {
        this.canSendHeaders(true);

        name = this._normalizeHeaders(name);

        if(replace) {
           Object.keys(this.headers).forEach((key) => {
               let value = null;
               if(name = key) {
                   delete this.headers[key];
               }
           });
        }

        this.headers[name] = value;

        return this;
    }

    getHeader(name) {
        return this.headers[name];
    }

    setRedirect(url, code = 302) {
        this.canSendHeaders(true);
        this.setHeader('Location', url, true)
            .setHttpResponseCode(code);

        return this;
    }

    isRedirect() {
        return this.redirected;
    }

    getHeaders() {
        return this.headers;
    }

    clearHeaders() {
        this.headers = {};

        return this;
    }

    clearHeader(name) {
        Object.keys(this.headers).forEach((key) => {
           let value = null;
           if(name = key) {
               delete this.headers[key];
           }
        });
    }

    setHttpResponseCode(code) {
        if(!VarUtil.isInt(code) || (100 > code) || (599 < code)) {
            throw new Error('Invalid HTTP response code');
        }

        if((300 <= code) && (307 >= code)) {
            this.redirected = true;
        }else{
            this.redirected = false;
        }

        this.httpResponseCode = code;

        return this;
    }

    getHttpResponseCode() {
        return this.httpResponseCode;
    }

    canSendHeaders(headersSent = false) {
        if(this.sendHeaders == false && headersSent == true) {
            this.sendHeaders = headersSent;
        }

        return this.sendHeaders;
    }

}

module.exports = Response;
