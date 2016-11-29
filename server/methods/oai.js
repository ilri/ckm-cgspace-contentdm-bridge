import js2xmlparser from 'js2xmlparser';

var metadataFormats = ['oai_dc'];

function getOAIResponseContainer(request) {
    return {
        "@": {
            "xmlns": "http://www.openarchives.org/OAI/2.0/",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd"
        },
        "responseDate": new Date().toISOString(),
        "request": request
    };
}

function getOAIDCRecord(item) {
    var issuedDate = item.issuedDate ? item.issuedDate.toISOString() : null;
    return {
        "header": {
            "identifier": item.url,
            "datestamp": item.modifiedDate.toISOString(),
            "setSpec": item.collection
        },
        "metadata": {
            "oai_dc:dc": {
                "@": {
                    "xmlns:oai_dc": "http://www.openarchives.org/OAI/2.0/oai_dc/",
                    "xmlns:doc": "http://www.lyncode.com/xoai",
                    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                    "xmlns:dc": "http://purl.org/dc/elements/1.1",
                    "xsi:schemaLocation": "http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd",
                },
                "dc:contributor": item.authors ? item.authors.split("; ") : "",
                "dc:date": [issuedDate, item.modifiedDate.toISOString()],
                "dc:description": item.abstract,
                "dc:identifier": [item.citation, item.doi, item.url],
                "dc:language": item.language,
                "dc:publisher": item.publisher ? item.publisher.split("; ") : "",
                "dc:relation": item.seriesName,
                "dc.subjects": item.agrovocSubjects ? item.agrovocSubjects.split("; ") : "",
                "dc:title": item.title,
                "dc:type": item.outputType,
                // "cg:contributor": item.crp,
                // "cg:coverageRegion": item.region ? item.region.split("; ") : "",
                // "cg:coverageCountry": item.country ? item.country.split("; ") : "",
                // "cg:place": item.place
            }
        }
    };
}

function getOAIDCItemHeader(item) {
    return {
        "identifier": item.url,
        "datestamp": new Date(item.modifiedDate).toISOString(),
        "setSpec": item.collection
    };
}

function getOAIError(code, message) {
    return {
        "@": {
            code: code
        },
        "#": message
    }
}

function getItemsToSkip(query) {
    return query.resumptionToken ? parseInt(query.resumptionToken.substr(query.resumptionToken.lastIndexOf('/') + 1)) - 1 : 0;
}

function getListFilters(query) {
    var filters = {};

    if (query.from) {
        filters["modifiedDate"] = {
            "$gte": new Date(query.from)
        };
    }

    if (query.until) {
        if (filters["modifiedDate"]) {
            filters["modifiedDate"]["$lte"] = new Date(query.until);
        } else {
            filters["modifiedDate"] = {
                "$lte": new Date(query.until)
            };
        }
    }

    if (query.set) {
        filters["collection"] = query.set;
    }

    return filters;
}

function getMetadataPrefix(query) {
    if(query.resumptionToken){
        return query.resumptionToken.split("/")[0];
    } else {
        return query.metadataPrefix;
    }
}

Meteor.methods({
    oaiGetRecord: function (query) {
        var resObj = {
            "#": Meteor.settings.app_endpoint
        };

        // Check if the metadata prefix and identifier are supplied
        if (!query.metadataPrefix || !query.identifier) {
            resObj["error"] = getOAIError("badArgument", "GetRecord verb requires the use of the parameters - identifier and metadataPrefix");
        } else {
            resObj = getOAIResponseContainer({
                "@": {
                    "verb": query.verb,
                    "identifier": query.identifier,
                    "metadataPrefix": query.metadataPrefix
                }
            });

            // Check if the metadata prefix is supported
            if (!_.contains(metadataFormats, query.metadataPrefix)) {
                resObj["error"] = getOAIError("cannotDisseminateFormat", "Unknown metadata format");
            } else {
                var item = Items.findOne({url: query.identifier});

                // Check if item exists in the database
                if (!item) {
                    resObj["error"] = getOAIError("idDoesNotExist", "No matching identifier");
                } else {

                    // Set the appropriate item depending on the metadata prefix
                    switch (query.metadataPrefix) {
                        case 'oai_dc':
                            resObj["GetRecord"] = _.map(pagedItems, function (item) {
                                return getOAIDCRecord(item);
                            });
                            break;
                    }
                }
            }
        }

        return js2xmlparser.parse("OAI-PMH", resObj, {
            "declaration": {
                "encoding": 'UTF-8'
            }
        });
    },
    oaiIdentify: function (query) {
        var resObj = getOAIResponseContainer({
            "@": {
                "verb": query.verb
            },
            "#": Meteor.settings.app_endpoint
        });

        resObj['Identify'] = {
            "repositoryName": "IFPRI Digital Library - CGSpace Intermediary",
            "baseURL": Meteor.settings.app_endpoint,
            "protocolVersion": "2.0",
            "adminEmail": "cgspace-support@cgiar.org",
            "earliestDatestamp": "2011-06-15",
            "deletedRecord": "transient",
            "granularity": "YYYY-MM-DD",
            "description": {
                "oai-identifier": {
                    "@": {
                        "xmlns": "http://www.openarchives.org/OAI/2.0/oai-identifier",
                        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                        "xsi:schemaLocation": "http://www.openarchives.org/OAI/2.0/oai-identifier http://www.openarchives.org/OAI/2.0/oai-identifier.xsd"
                    },
                    "scheme": "oai",
                    "repositoryIdentifier": "104.236.11.158",
                    "delimiter": ":",
                    "sampleIdentifier": "oai:104.236.11.158:10568/1234"
                }
            }
        };

        return js2xmlparser.parse("OAI-PMH", resObj, {
            "declaration": {
                "encoding": 'UTF-8'
            }
        });
    },
    oaiListIdentifiers: function (query) {
        var skip = getItemsToSkip(query);
        var filters = getListFilters(query);
        var metadataPrefix = getMetadataPrefix(query);
        var resObj = getOAIResponseContainer({
            "#": Meteor.settings.app_endpoint
        });

        // Check if a metadata prefix is given
        if (!metadataPrefix) {
            resObj["error"] = getOAIError("badArgument", "ListIdentifiers verb must receive the metadataPrefix parameter");
        } else {
            resObj["request"]["@"] = query.resumptionToken ? {
                "verb": query.verb,
                "resumptionToken": query.resumptionToken
            } : {
                "verb": query.verb,
                "metadataPrefix": metadataPrefix
            };

            // Check if the metadata prefix is a supported format
            if (!_.contains(metadataFormats, metadataPrefix)) {
                resObj["error"] = getOAIError("cannotDisseminateFormat", "Unknown metadata format");
            } else {
                var pagedItems = Items.find(filters, {
                    sort: {itemId: -1},
                    skip: skip,
                    limit: 100
                }).fetch();

                var itemHeaders = [];

                // TODO: Add custom CG metadata item handling here
                switch (metadataPrefix) {
                    case 'oai_dc':
                        itemHeaders = _.map(pagedItems, function (item) {
                            return getOAIDCItemHeader(item);
                        });
                        break;
                }

                resObj["ListIdentifiers"] = {
                    'header': itemHeaders
                };
            }
        }

        return js2xmlparser.parse("OAI-PMH", resObj, {
            "declaration": {
                "encoding": 'UTF-8'
            }
        });
    },
    oaiListMetadataFormats: function (query) {
        var resObj = getOAIResponseContainer({
            "@": {
                "verb": query.verb
            },
            "#": Meteor.settings.app_endpoint
        });

        // TODO: Add custom CGSpace Metadata format
        resObj['ListMetadataFormats'] = {
            "metadataFormat": [
                {
                    "metadataPrefix": "oai_dc",
                    "schema": "http://www.openarchives.org/OAI/2.0/oai_dc.xsd",
                    "metadataNamespace": "http://www.openarchives.org/OAI/2.0/oai_dc/"
                }
            ]
        };

        return js2xmlparser.parse("OAI-PMH", resObj, {
            "declaration": {
                "encoding": 'UTF-8'
            }
        });
    },
    oaiListRecords: function (query) {
        var skip = getItemsToSkip(query);
        var filters = getListFilters(query);
        var metadataPrefix = getMetadataPrefix(query);
        var resObj = getOAIResponseContainer({
            "#": Meteor.settings.app_endpoint
        });

        // Check if a metadata prefix is given
        if (!metadataPrefix) {
            resObj["error"] = getOAIError("badArgument", "ListRecords verb must receive the metadataPrefix parameter");
        } else {
            resObj["request"]["@"] = query.resumptionToken ? {
                "verb": query.verb,
                "resumptionToken": query.resumptionToken
            } : {
                "verb": query.verb,
                "metadataPrefix": metadataPrefix
            };

            // Check if the metadata prefix is a supported format
            if (!_.contains(metadataFormats, metadataPrefix)) {
                resObj["error"] = getOAIError("cannotDisseminateFormat", "Unknown metadata format");
            } else {
                var pagedItems = Items.find(filters, {
                    sort: {itemId: -1},
                    skip: skip,
                    limit: 100
                }).fetch();

                var itemRecords = [];

                // TODO: Add custom CG metadata item handling here
                switch (metadataPrefix) {
                    case 'oai_dc':
                        itemRecords = _.map(pagedItems, function (item) {
                            return getOAIDCRecord(item);
                        });
                        break;
                }

                resObj["ListRecords"] = {
                    'record': itemRecords
                };
            }
        }

        return js2xmlparser.parse("OAI-PMH", resObj, {
            "declaration": {
                "encoding": 'UTF-8'
            }
        });
    },
    oaiListSets: function (query) {

        var endPoints = EndPoints.find({}).fetch();

        var endPointSets = _.map(endPoints, function (endPoint) {
            return {
                setSpec: endPoint.collection,
                setName: endPoint.name
            };
        });

        var resObj = getOAIResponseContainer({
            "@": {
                "verb": query.verb
            },
            "#": Meteor.settings.app_endpoint
        });

        resObj["ListSets"] = {
            'set': endPointSets
        };

        return js2xmlparser.parse("OAI-PMH", resObj, {
            "declaration": {
                "encoding": 'UTF-8'
            }
        });
    }
});
