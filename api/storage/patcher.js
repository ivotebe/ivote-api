var _ = require('underscore');

module.exports.patch = function(doc, patches) {
    patches.forEach(function(patch) {
        applyPatch(doc, patch);
    });

    return doc;
};

function applyPatch(doc, patch) {
    if (! patch.op) throw new Error('No patch operation has been provided');
    if (! patch.fld) throw new Error('No patch field has been provided');

    // -- we will initialize the doc field as an array if needed
    if (!doc.hasOwnProperty(patch.fld) || !doc[patch.fld]) doc[patch.fld] = [];
    else if (! isArray(doc[patch.fld])) doc[patch.fld] = [doc[patch.fld]];

    switch (patch.op) {
        case 'set':
            doSet(doc, patch);

            break;
        case 'add':
            doAdd(doc, patch);
            break;

        case 'upd':
            doUpdate(doc, patch);
            break;

        case 'remove':
            doRemove(doc, patch);

            break;
        case 'purge':
            doPurge(doc, patch);

            break;
    }
}

function doSet(doc, patch) {
    if (patch.old) {
        // -- if an old value is given, we will first look that one up since that is the one we need to
        // -- replace
        var i = -1;
        for (var j = 0; j < doc[patch.fld].length; j++) {
            if (_.isEqual(doc[patch.fld][j], patch.old)) {
                i = j;
                break;
            }
        }

        if (i == -1) doc[patch.fld].push(patch.val);
        else doc[patch.fld][i] = patch.val;
    } else {
        doc[patch.fld] = (isArray(patch.val)) ? patch.val : [patch.val];
    }
}

function doAdd(doc, patch) {
    if (! patch.unq) {
        // -- the value does not have to be unique.
        doc[patch.fld].push(patch.val);
    } else {
        // -- check if there is already a value like this
        var idx = doc[patch.fld].indexOf(patch.val);
        if (idx == -1) doc[patch.fld].push(patch.val);
    }
}

function doRemove(doc, patch) {
    // -- in case of an array
    var i = -1;
    for (var j = 0; j < doc[patch.fld].length; j++) {
        if (_.isEqual(doc[patch.fld][j], patch.val)) {
            i = j;
            break;
        }
    }

    if (i > -1) doc[patch.fld].splice(i, 1);

    if (doc[patch.fld].length == 0) delete doc[patch.fld];
}

function doPurge(doc, patch) {
    doc[patch.fld] = null;
}

function isArray(obj) {
    return ( Object.prototype.toString.call( obj ) === '[object Array]' )
}

function isEmpty(obj) {
    return obj.length == 0;
}