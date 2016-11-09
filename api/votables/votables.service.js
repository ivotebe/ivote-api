var config = require('../config'),
    errors = require('../errors'),
    storage = require('../storage');

var Q = require('q');

module.exports = {
    find: findVotables,
    get: getVotable,
    set: setVotable,
    remove: removeVotable
};

function findVotables(type, status) {
    var filters = [];

    // -- type
    if (type && type != "" && type != "any") filters.push({term: { votableType: type }});

    // -- status
    if (status == "scheduled") {
        filters.push({range: { activation_date: { lt: new Date() } }});
    } else if (status == "active") {
        filters.push({range: { activation_date: { gte: new Date() } }});
        filters.push({range: { end_date: { lt: new Date() } }});
    } else if (status == "finished") {
        filters.push({range: { end_date: { gte: new Date() } }});
        filters.push({range: { published_date: { lt: new Date() } }});
    } else if (status == "published") {
        filters.push({range: { published_date: { gte: new Date() } }});
    }

    var query = {
        "query": {
            "filtered": {
                "query": { "match_all": {} },
                "filter": {"bool": {"must": filters }}
            }
        }
    };

    var fields = [ "id", "type", "content", "tags", "activation_date", "end_date", "publication_date"];

    return storage.find("votable", query, { fields: fields }).then(function(response) {
        return response;
    });
}

function getVotable(id) {
    if (!id || id == "") return Q.reject(new errors.IllegalParameterError("no valid id has been provided"));

    return storage.get("votable", id);
}

function setVotable(id, data) {
    if (!id || id == "") return Q.reject(new errors.IllegalParameterError("no valid id has been provided"));

    return storage.set("votable", id, data);
}

function removeVotable(id) {
    if (!id || id == "") return Q.reject(new errors.IllegalParameterError("no valid id has been provided"));

    return storage.remove("votable", id);
}