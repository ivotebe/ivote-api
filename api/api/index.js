/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var log4js          = require('log4js'),
    express         = require('express'),
    bodyParser      = require('body-parser'),
    errorHandler    = require('errorhandler'),
    cors            = require('cors'),
    jwt             = require('express-jwt');

function API(port, secret) {
    this.routerModules = [];

    this.app = express();

    this.port = port;
    this.jwtCheck = jwt({
        secret: new Buffer(secret, 'base64')
    });
}

API.prototype.router = function(path) {
    this.routerModules.push(path);

    return this;
};

API.prototype.listen = function() {
    var app = this.app;
    var port = this.port;
    var jwt = this.jwtCheck;

    logger.debug("Loading the cors middleware");
    var corsOptions = { methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD'], origin: "*" };
    app.use(cors(corsOptions));

    logger.debug("Loading the JSON body parser");
    app.use(bodyParser.json());

    logger.debug("Loading application routers");
    this.routerModules
        .map(function(item) { logger.info("Loading application router " +  item); return require(item); })
        .map(function(item) { return item(jwt); })
        .forEach(app.use);

    logger.info("Loading the health check endpoint");
    this.registerGet('/health', function(req, res) { return res.status(200).end(); });

    logger.debug("Loading the error handler");
    app.use(errorHandler());

    app.listen(port, function () {
        logger.info();
        logger.info('API listening on port ' + port);
        logger.info();
    });
};

// ====================================================================================================================
// == Authorization Roles
// ====================================================================================================================
// API.prototype.onlyIfCollaboratorOrOwner = function(lookupService) {
//     return function(req, res, next) {
//         var user = req.user;
//         if (! user) {
//             winston.warn('Not allowed to execute an api call for which a user has to be authenticated.');
//
//             return res.status(401).send("Not Authorized");
//         }
//
//         var type = req.params['type'];
//         var owner = req.params['owner'];
//         var slug = req.params['slug'];
//
//         if (!type || !owner || !slug) {
//             winston.warn('Not enough parameters defined to determine the permissions');
//
//             return res.status(400).send("No owner has been defined");
//         }
//
//         if (user.hive_id != owner) {
//             lookupService.permissions(type, owner, slug, req.user.hive_id).then(function(result) {
//                 if (! result) {
//                     return res.status(403).send("Not Authorized");
//                 } else {
//                     // --  currently we take no interest in the defined permissions on the collaborator object. If it
//                     // -- is a collaborator access is granted
//                     next();
//                 }
//             });
//         } else {
//             return next();
//         }
//     }
// };
//
// API.prototype.onlyIfOwner = function() {
//     return function(req, res, next) {
//         var owner = req.params['owner'];
//         var user = req.user;
//
//         if (! owner) {
//             winston.warn('No owner has been specified as a parameter on the request. It is needed to verify if the user is actually the owner of the called resource.');
//
//             return res.status(400).send("No owner has been defined");
//         }
//
//         if (! user) {
//             winston.warn('Not allowed to execute an api call for which a user has to be authenticated.');
//
//             return res.status(401).send("Not Authorized");
//         }
//
//         if (user.hive_id != owner) {
//             winston.warn('Only the owner of the resource (which you are not) is allowed to call the endpoint.');
//
//             return res.status(403).send("Not Authorized");
//         }
//
//         return next();
//     }
// };
//
// API.prototype.onlyIfMe = function(req, res, next) {
//     var userId = req.params['id'];
//     var user = req.user;
//
//     if (! userId) {
//         winston.warn('No user id has been specified as a parameter on the request. It is needed to verify if the user is actually the owner of the called resource.');
//
//         return res.status(400).send("No user id has been defined");
//     }
//
//     if (! user) {
//         winston.warn('Not allowed to execute an api call for which a user has to be authenticated.');
//
//         return res.status(401).send("Not Authorized");
//     }
//
//     if (user != userId) {
//         winston.warn('Only the owner of the resource (which you are not) is allowed to call the endpoint.');
//
//         return res.status(403).send("Not Authorized");
//     }
//
//     return next();
// };
//
// API.prototype.onlyIfUser = function() {
//     return function(req, res, next) {
//         var user = req.user;
//
//         if (! user) {
//             return res.status(401).send("Not Authenticated");
//         }
//
//         return next();
//     };
// };
//
// API.prototype.onlyIfRole = function(role) {
//     return function(req, res, next) {
//         var user = req.user;
//
//         if (! user) {
//             return res.status(401).send("Not Authenticated");
//         }
//
//         if (! user.roles && user.roles.indexOf(role) === -1) return res.status(403).send('Not Authorized');
//
//         return next();
//     };
// };

// ====================================================================================================================
// == API METHODS
// ====================================================================================================================

API.prototype.registerHead = function(path, fn) {
    this.app.head(path, fn);
    logger.info('   [HEAD] ' + path);
};

API.prototype.registerSecureHead = function(path, guard, fn) {
    this.app.head(path, this.jwtCheck, guard, fn);
    logger.info('  [sHEAD] ' + path);
};

API.prototype.registerGet = function(path, fn) {
    this.app.get(path, fn);
    logger.info('   [GET] ' + path);
};

API.prototype.registerSecureGet = function(path, guard, fn) {
    this.app.get(path, this.jwtCheck, guard, fn);
    logger.info('  [sGET] ' + path);
};

API.prototype.registerPut = function(path, fn) {
    this.app.put(path, function(req, res) { return fn(req, res); });
    logger.info('    [PUT] ' + path);
};

API.prototype.registerSecurePut = function(path, guard, fn) {
    this.app.put(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    logger.info('   [sPUT] ' + path);
};

API.prototype.registerPost = function(path, fn) {
    this.app.post(path, function(req, res) { return fn(req, res); });
    logger.info('   [POST] ' + path);
};

API.prototype.registerSecurePost = function(path, guard, fn) {
    this.app.post(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    logger.info('  [sPOST] ' + path);
};

API.prototype.registerPatch = function(path, fn) {
    this.app.patch(path, function(req, res) { return fn(req, res); });
    logger.info('   [PATCH] ' + path);
};

API.prototype.registerSecurePatch = function(path, guard, fn) {
    this.app.patch(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    logger.info('  [sPATCH] ' + path);
};

API.prototype.registerDelete = function(path, fn) {
    this.app.delete(path, function(req, res) { return fn(req, res); });
    logger.info('[DELETE] ' + path);
};

API.prototype.registerSecureDelete = function(path, guard, fn) {
    this.app.delete(path, this.jwtCheck, guard, function(req, res) { return fn(req, res); });
    logger.info('[sDELETE] ' + path);
};

module.exports = API;