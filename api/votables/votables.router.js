var express = require('express'),
    votableService = require('./votables.service');

module.exports = function(jwt) {
    var router = express.Router();

    router.get('/votables', findVotables);

    router.get('/votables/:id', getVotable);
    router.put('/votables/:id', setVotable);
    // router.patch('/votables/:id', findVotables);
    router.remove('/votables/:id', removeVotable);

    return router;
};

/**
 * Find all the votables matching the given criteria.
 *
 * @param req   the HTTP request
 * @param res   the HTTP response
 */
function findVotables(req, res) {
    votableService.find(req.query('type'), req.query('status')).then(
        function(response) {
            res.status(200).json(response);
        },
        function(error) {
            res.status(500).json({ error: error });
        }
    );
}

/**
 * Get a single votable by its id.
 *
 * @param req   the HTTP request
 * @param res   the HTTP response
 */
function getVotable(req, res) {
    votableService.get(req.param("id")).then(
        function(response) {
            res.status(200).json(response);
        },
        function(error) {
            res.status(500).json({ error: error });
        }
    );
}

/**
 * Set the data for the votable with the given id.
 *
 * @param req   the HTTP request
 * @param res   the HTTP response
 */
function setVotable(req, res) {
    votableService.set(req.param("id"), req.body).then(
        function(response) {
            res.status(200).json(response);
        },
        function(error) {
            res.status(500).json({ error: error });
        }
    );
}

/**
 * Remove the votable with the given id.
 *
 * @param req   the HTTP request
 * @param res   the HTTP response
 */
function removeVotable(req, res) {
    votableService.remove(req.param("id")).then(
        function(response) {
            res.status(200).json(response);
        },
        function(error) {
            res.status(500).json({ error: error });
        }
    );
}