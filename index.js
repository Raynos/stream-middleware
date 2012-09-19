var slice = Array.prototype.slice
    , Router = require("routes").Router

middleware.StreamRouter = StreamRouter
middleware.Methods = Methods
middleware.pipeline = pipeline

module.exports = middleware

function middleware(options) {
    options = options || {}

    var routeHandler = StreamRouter(options.matcher, options.notFound)

    routeHandler.route = route

    return routeHandler

    function route(uri) {
        var streams = slice.call(arguments, 1)

        if (streams.length === 0) {
            var hash = {}
                , methods = Methods(hash, options.noMethod)

            routeHandler.method = method
            routeHandler.addRoute(uri, methods)
        } else {
            routeHandler.addRoute(uri, pipeline(streams))
        }

        return routeHandler

        function method(methodName) {
            var streams = slice.call(arguments, 1)
            hash[methodName] = pipeline(streams)
        }
    }
}

function Methods(hash, NoMethod) {
    hash = hash || {}

    NoMethod = NoMethod || defaultNoMethod

    function handler(req, res) {
        return hash[req.method] || NoMethod(req, res)
    }
}

function defaultNoMethod(req, res) {
    res.statusCode = 405
    res.end("Method not Allowed.")
}

function pipeline(streams) {
    if (!Array.isArray(streams)) {
        streams = slice.call(arguments)
    }

    return handler

    function handler(readable, writable) {
        var source, target, current

        if (readable.read) {
            source = readable
        } else {
            throw new Error("must pass in a readable stream")
        }

        if (readable.write) {
            target = readable
        } else if (writable && writable.write) {
            target = writable
        } else {
            throw new Error("must pass in a writable stream")
        }

        streams
            .map(createStream)
            .reduce(pipeNext, source)
            .pipe(target)

        function createStream(Stream) {
            return Stream(source, target)
        }
    }
}

function pipeNext(prev, current) {
    return prev.pipe(current)
}

function StreamRouter(matcher, NoStream) {
    var router = new Router()

    matcher = matcher || defaultMatcher
    NoStream = NoStream || defaultNoStream

    handler.addRoute = router.addRoute.bind(router)

    return handler

    function handler(source, target) {
        var route = router.match(matcher(source))
            , stream

        if (route) {
            stream = route.fn
            source.params = route.params
            source.splats = route.splats
        } else {
            stream = NoStream(source, target)
        }

        return stream
    }
}

function defaultMatcher(source) {
    return source.url || source.meta
}

function defaultNoStream(req, res) {
    res.statusCode = 404
    res.end("route was not found " + req.url)
}