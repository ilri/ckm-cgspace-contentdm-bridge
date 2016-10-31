import js2xmlparser from 'js2xmlparser';

Meteor.methods({
    oaiListRecords: function (query) {
        var skip = parseInt(query.resumptionToken.substr(resumptionToken.lastIndexOf('/') + 1)) - 1;
        skip = skip || 0;

        var pagedItems = Items.find({}, {
            sort: { itemId: -1 },
            skip: skip,
            limit: 100
        }).fetch();

        var itemRecords = _.map(pagedItems, function(item){
           return {
               "header": {
                   "identifier": "oai:" + item.collection + ":" + item.itemId,
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
           }
        });

        var resObj = {
            "@": {
                "xmlns": "http://www.openarchives.org/OAI/2.0/",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:schemaLocation": "http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd"
            },
            "responseDate": new Date(),
            "request": {
                "@": {
                    "verb": verb,
                    "resumptionToken": resumptionToken
                },
                "#": "http://localhost:3000/oai/request"
            },
            "ListRecords": {
                'record': itemRecords
            }
        };

        return js2xmlparser.parse("OAI-PMH", resObj);
    }
});

