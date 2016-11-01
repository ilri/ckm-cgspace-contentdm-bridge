import js2xmlparser from 'js2xmlparser';

function getOAIResponseContainer(request) {
    return {
        "@": {
            "xmlns": "http://www.openarchives.org/OAI/2.0/",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd"
        },
        "responseDate": new Date(),
        "request": request
    };
}

function getOAIRecord(item) {
    return {
        "header": {
            "identifier": item.url,
            "datestamp": new Date(item.modifiedDate),
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
                "dc:date": [item.issuedDate, item.modifiedDate],
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

function getOAIItemHeader(item) {
    return {
        "identifier": item.url,
        "datestamp": new Date(item.modifiedDate),
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

Meteor.methods({
    oaiGetRecord: function (query) {
        var item = Items.findOne({url: query.identifier});
        var resObj = getOAIResponseContainer({
            "@": {
                "verb": query.verb,
                "identifier": query.identifier,
                "metadataPrefix": query.metadataPrefix
            },
            "#": Meteor.settings.app_endpoint
        });

        // TODO: also handle the cannotDisseminateFormat error
        if (!item) {
            resObj["error"] = getOAIError("idDoesNotExist", "No matching identifier.");
        } else {
            resObj["GetRecord"] = {
                'record': getOAIRecord(item)
            };
        }

        return js2xmlparser.parse("OAI-PMH", resObj);
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
            "granularity": "YYYY-MM-DD"
        };

        return js2xmlparser.parse("OAI-PMH", resObj);
    },
    oaiListIdentifiers: function (query) {

        var skip = getItemsToSkip(query);
        var filters = getListFilters(query);

        var pagedItems = Items.find(filters, {
            sort: {itemId: -1},
            skip: skip,
            limit: 100
        }).fetch();

        var itemHeaders = _.map(pagedItems, function (item) {
            return getOAIItemHeader(item);
        });

        var resObj = getOAIResponseContainer({
            "@": {
                "verb": query.verb,
                "resumptionToken": query.resumptionToken
            },
            "#": Meteor.settings.app_endpoint
        });

        resObj["ListRecords"] = {
            'header': itemHeaders
        };

        return js2xmlparser.parse("OAI-PMH", resObj);
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
            "metadataFormat": {
                "metadataPrefix": "oai_dc",
                "schema": "http://www.openarchives.org/OAI/2.0/oai_dc.xsd",
                "metadataNamespace": "http://www.openarchives.org/OAI/2.0/oai_dc/"
            }
        };

        return js2xmlparser.parse("OAI-PMH", resObj);
    },
    oaiListRecords: function (query) {

        var skip = getItemsToSkip(query);
        var filters = getListFilters(query);

        var pagedItems = Items.find(filters, {
            sort: {itemId: -1},
            skip: skip,
            limit: 100
        }).fetch();

        var itemRecords = _.map(pagedItems, function (item) {
            return getOAIRecord(item);
        });

        var resObj = getOAIResponseContainer({
            "@": {
                "verb": query.verb,
                "resumptionToken": query.resumptionToken
            },
            "#": Meteor.settings.app_endpoint
        });

        resObj["ListRecords"] = {
            'record': itemRecords
        };

        return js2xmlparser.parse("OAI-PMH", resObj);
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

        resObj["ListRecords"] = {
            'set': endPointSets
        };

        return js2xmlparser.parse("OAI-PMH", resObj);
    }
});

