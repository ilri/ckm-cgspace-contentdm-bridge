fetchIntervalHandle = null;
fetchSettings = new ReactiveVar({});

Meteor.methods({
    getEndPointItems: function (endpoint) {
        this.unblock();

        var newAdditions = 0;

        Meteor.http.get(endpoint.url, function (error, results) {
            if (error) throw error;

            if ((results.data.records.length)) {
                // Update endpoint with received results
                EndPoints.update({_id: endpoint._id}, {$set: {pager: results.data.pager}});

                _.each(results.data.records, function (item) {

                    // Check if the items is not in the database
                    if (Items.Collection.find({itemId: item.dmrecord}).count() == 0) {
                        var doc = {
                            collection: item.collection.replace("/", ""),
                            itemId: item.dmrecord,
                            title: item.title + ": " + item.subtit,
                            authors: item.creato,
                            issueDate: item.date,                     // check CGS REST response
                            modifiedDate: item.dmmodified,
                            importedDate: new Date(),
                            abstract: item.descri,
                            seriesName: item.series,                  // check CGS Rest response
                            seriesNumber: item.seriesa,               // check CGS Rest response
                            publisher: item.publis,
                            place: item.place,
                            citation: item.full,
                            language: filterLanguage(item.langua),                    // select values
                            agrovocSubjects: item.loc,                // to uppercase
                            region: item.subjec,                      // strip countries from list
                            country: item.subjec,                     // strip regions from list
                            url: "http://ebrary.ifpri.org/cdm/ref/collection/" + item.collection.replace("/", "") + "/id/" + item.dmrecord,
                            crp: item.cgiar,                          // to uppercase and select values
                            outputType: item.type,
                            orcid: item.orcid,
                            doi: item.doi
                        };

                        Items.Collection.insert(doc);
                        // increment new items count
                        newAdditions++;
                        // send progress percentage
                        fetchEvent.emit("progress", Meteor.userId(), newAdditions, (newAdditions / this.length) * 100 + "%");
                    }
                }, results.data.records);
                // send completed adding items event
                fetchEvent.emit("complete", Meteor.userId(), newAdditions);
            }
        });
    },
});

function filterLanguage(language){
    var cgLanguages = [
        {value: "am", name: "Amharic"},
        {value: "zh", name: "Chinese"},
        {value: "en", name: "English"},
        {value: "es", name: "Spanish"},
        {value: "de", name: "German"},
        {value: "fr", name: "French"},
        {value: "id", name: "Indonesian"},
        {value: "it", name: "Italian"},
        {value: "pt", name: "Portuguese"},
        {value: "ja", name: "Japanese"},
        {value: "om", name: "Oromiffa"},
        {value: "sw", name: "Swahili"},
        {value: "tr", name: "Turkish"},
        {value: "vi", name: "Vietnamese"}
    ];
    var lang = _.find(cgLanguages, function(l){
        return this == l.name;
    }, language);

    lang = lang || {value: "other", name: "(Other)"};
    return lang.value;
}
