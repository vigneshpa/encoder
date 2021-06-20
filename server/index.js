const port = process.env.PORT || 8000;
const express = require("express");
const compression = require("compression");
const { join } = require("path");
const app = express();


//cross site isolation
app.use(function(req, res, next) {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });
app.use(compression());
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] === 'http') {
        res.redirect(307, `https://${req.hostname + req.originalUrl}`);
    } else next();
});
app.use(express.static(join(__dirname, "public")));
app.set("views", "./views");
app.set("view engine", "pug");

// handeling errors
app.use(function (req, res) {
    res.status(404).render("error", { code: 404, title: "Oops!", message: "We are unable to find this page. You might want to check the url." });
});
app.use(function (error, req, res, next) {
    res.status(500).render("error", { code: 500, title: "Sorry!", message: "Some unrecoverable error happened.Please contact us.", details: inspect(error) });
});

app.listen(port);
console.log("listening on ", {port});