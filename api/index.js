var express = require('express'),
    log4js = require('log4js');

var logger = log4js.getLogger("main");

var app = express();

app.use(require("./votables/votables.router"));

app.listen(3000, function () {
    logger.info('IVote API listening on port 3000!');
});
