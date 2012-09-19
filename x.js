var streams = require("stream-middleware")
    , partial = require("ap").partial
    , path = require("path")
    , through = require("through-stream")
    , from = require("read-stream")
    , filed = require("filed")
    , request = require("request")
    , http = require("http")

var app = streams()
    .route("/static/*", partial(filed, path.join(__dirname, "static")))

    .route("/proxypass", function (req) {
        return request("http://otherserver.com" + req.url)
    })

    .route("/hello.json"
        , partial(from, [{ msg: "hello" }])
        , partial(through, function (chunk, buffer) {
            buffer.push(JSON.stringify(chunk))
        })
        , header("content-type", "text/html"))

    .route("/plaintext"
        , partial(from, ["I like text/plain"])
        , header("content-type", "text/html"))

    .route("/")
        .method("GET"
            , partial(request, "http://me.iriscouch.com/db", {
                json: true
            })
            , partial(through, function (chunk, buffer) {
                buffer.push("<html><head>cool</head><body>" + chunk.index +
                    "</body></html>")
            })
            , header("content-type", "text/html"))
    ;

http.createServer(app, 3000)

function header(key, value) {
    return function (req, res) {
        return through(through.write, function () {
            res.setHeader(key, value)
        })
    }
}

function call(f) {
    return function() {
        f()
    }
}