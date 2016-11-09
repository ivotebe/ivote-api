var config = require('../config'),
    errors = require('../errors');

var Q = require('q'),
    elasticsearch = require('elasticsearch');

// -- elasticsearch connection
var esConfig = {
    "host": config.elasticsearch.host,
    "auth": config.elasticsearch.user + ':' + config.elasticsearch.password
};

var es = new elasticsearch.Client(esConfig);

module.exports = {
    find: find,
    exists: exists,
    get: get,
    set: set,
    remove: remove
};

function find(entityType, query, opts) {
    var req = {
        index: config.elasticsearch.index,
        type: entityType,
        body: query
    };

    if (opts.fields) req.fields = opts.fields;

    if (opts.paging) {
        if (opts.paging.size) req.size = opts.paging.size;
        if (opts.paging.offset) req.from = opts.paging.offset;
    } else {
        req.size = 25;
    }

    return es.search(req);
}

function exists(entityType, entityId) {
    var metadata = {
        index: config.elasticsearch.index,
        type: entityType,
        id: entityId
    };

    return es.exists(metadata);
}

function get(entityType, entityId, opts) {
    var metadata = {
        index: config.elasticsearch.index,
        type: entityType,
        id: entityId
    };

    if (opts.fields) metadata.fields = opts.fields;

    return es.get(metadata);
}

function set(entityType, entityId, data) {
    var metadata = {
        index: config.elasticsearch.index,
        type: entityType,
        id: entityId,
        body: data
    };

    return es.index(metadata);
}

function remove(entityType, entityId) {
    return exists(entityType, entityId)
        .then(function(response) {
            if (response === false) return Q.reject(new errors.NotFoundError("Not Found"));

            return es.delete({ index: config.elasticsearch.index, type: entityType, id: entityId });
        });
}