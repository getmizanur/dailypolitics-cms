const StringUtil = require('../../util/stringUtil'); 

class Request {

    constructor(options = {}){
		this.HTTP_METHODS = [
			'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'
		]

        this.METHOD_GET = "GET";
        this.METHOD_POST = "POST";
        this.METHOD_PUT = "PUT";
        this.METHOD_DELETE = "DELELTE";
        this.METHOD_PATCH = "PATCH";
        this.METHOD_HEAD = "HEAD";

        this.method = options.method || null;
        this.url = options.url || null;
        this.query = options.query || null;
        this.post = options.post || null;
        this.headers = options.headers || null;
		this.dispatched = null;

		this.module = options.module || null;
		this.controller = options.controller || null;
	    this.action = options.action || null;

        this.routePath = null;
        this.url = null;
        this.path = null;
        this.routeName = null;
        this.session = null; // Express-session req.session object
    }

	setMethod(value) {
		if(!this.HTTP_METHODS.includes(StringUtil.strtoupper(value))) {
			throw new Error('Invalid HTTP method passed');
		}
		this.method = value;

        return this;
    }

	getMethod() {
		return this.method;
	}

	setModuleName(value) {
		this.module = value;

        return this;
	}

	getModuleName() {
		return this.module;
	}

	setControllerName(value) {
		this.controller = value;

        return this;
	}

	getControllerName() {
		return this.controller;
	}

	setActionName(value) {
		this.action = value;

        return this;
	}

	getActionName() {
		return this.action;
	}

    setPost(post) {
        this.post = post;

        return this;
    }

	getPost(key, defaultValue = null) {
		if(this.post.hasOwnProperty(key)) {
			return this.post[key]; 
		}

        if(key == null) {
            return this.post;
        }
	
		return dafaultValue;
	}

    setQuery(query) {
        this.query = query;

        return this;
    }

    getQuery(key, defaultValue = null) {
        if (!this.query || typeof this.query !== 'object') {
            return key === null ? {} : defaultValue;
        }
        
        if(this.query.hasOwnProperty(key)) {
			return this.query[key]; 
		}

        if(key == null) {
            return this.query;
        }
	
		return defaultValue;
    }

    setHeaders(headers) {
        this.headers = req.headers;

        return this;
    }

    getHeaders(key, defaultValue = null) {
        if(this.headers.hasOwnProperty(key)) {
			return this.headers[key]; 
		}

        if(key == null) {
            return this.query;
        }
	
		return dafaultValue;
    }

    getHeader(key, defaultValue = null) {
        return this.getHeaders(key, defaultValue);
    }

    setRoutePath(routePath) {
        this.routePath = routePath;

        return this;
    }

    getRoutePath() {
        return this.routePath; 
    }

    setUrl(url) {
        this.url = url;

        return this;
    }

    getUrl() {
        return this.url;
    }

    setPath(path) {
        this.path = path;

        return this;
    }

    getPath() {
        return this.path;
    }

    setParams(params) {
        this.params = params;
        return this;
    }

    getParam(key, defaultValue = null) {
        if (!this.params || typeof this.params !== 'object') {
            return key === null ? {} : defaultValue;
        }
        
        if(this.params.hasOwnProperty(key)) {
            return this.params[key]; 
        }

        if(key == null) {
            return this.params;
        }
    
        return defaultValue;
    }

    getParams() {
        return this.params || {};
    }

	setDispatched(flag = true) {
		this.dispatched = flag ? true : false;		

        return this;
	}

	isDispatched() {
		return this.dispatched;
	}

    isGet() {
        return (this.HTTP_METHODS.indexOf(this.method) !== -1 
            && this.method === this.METHOD_GET);
    }

    isPost() {
        return (this.HTTP_METHODS.indexOf(this.method) !== -1 
            && this.method === this.METHOD_POST);
    }

    isPut() {
        return (this.HTTP_METHODS.indexOf(this.method) !== -1 
            && this.method === this.METHOD_PUT);
    }

    isDelete() {
        return (this.HTTP_METHODS.indexOf(this.method) !== -1 
            && this.method === this.METHOD_DELETE);
    }

    setRouteName(routeName) {
        this.routeName = routeName;
        return this;
    }

    getRouteName() {
        return this.routeName;
    }

    setSession(session) {
        this.session = session;
        return this;
    }

    getSession() {
        return this.session;
    }

}

module.exports = Request;
