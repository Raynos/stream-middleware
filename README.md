# stream-middleware

Streams as middleware

## Example

```
var streams = require("stream-middleware")
    , pipe = streams.pipe
    , partial = require("ap").partial
    , path = require("path")
    , through = require("through-stream")
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
        , partial(through, JSON.stringify)
        , header("content-type", text/html"))

    .route("/plaintext"
        , partial(from, ["I like text/plain"])
        , header("content-type", text/html"))

    .route("/")
        .method("GET"
            , partial(request, "http://me.iriscouch.com/db", {
                json: true
            })
            , call(es.wait)
            , partial(es.mapSync, function (chunk) {
                return "<html><head>cool</head><body>" + chunk.index +
                    "</body></html>"
            })
            , header("content-type", text/html"))
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
```

## Installation

`npm install stream-middleware`

## Contributors

 - Raynos

## MIT Licenced