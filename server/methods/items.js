fetchIntervalHandle = null;
fetchSettings = new ReactiveVar({});

function filterLanguage(language) {
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
    var lang = _.find(cgLanguages, function (l) {
        return this == l.name;
    }, language);

    lang = lang || {value: "other", name: "(Other)"};
    return lang.value;
}

function filterRegions(regions) {
    var cgRegions = [
        "ACP", "AFRICA", "AFRICA SOUTH OF SAHARA", "ASIA", "CARIBBEAN", "CARIBBEAN", "CENTRAL AFRICA", "CENTRAL AMERICA",
        "CENTRAL ASIA", "EAST ASIA", "EAST AFRICA", "EUROPE", "LATIN AMERICA", "MIDDLE EAST", "NORTH AFRICA", "NORTH AMERICA",
        "PACIFIC", "SOUTH ASIA", "SOUTHEAST ASIA", "SOUTHERN AFRICA", "PACIFIC", "SAHEL", "SOUTH AMERICA", "WEST AFRICA",
        "WEST ASIA", "WEST AND CENTRAL AFRICA"
    ];


    var context = {
        cgRegions: cgRegions,
        itemRegions: regions.split("; "),
        filteredRegions: []
    };

    _.each(context.itemRegions, function (l) {
        if (_.contains(this.cgRegions, l.toUpperCase())) {
            context.filteredRegions.push(l.toUpperCase());
        }
    }, context);

    return context.filteredRegions.join("; ");
}

function filterCountries(countries) {
    var cgCountries = [
        "AFGHANISTAN", "ALBANIA", "ALGERIA", "AMERICAN SAMOA", "ANDORRA", "ANGOLA", "ANGUILLA", "ANTARCTICA",
        "ANTIGUA AND BARBUDA", "ARGENTINA", "ARMENIA", "ARUBA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BAHAMAS",
        "BAHRAIN", "BANGLADESH", "BARBADOS", "BELARUS", "BELGIUM", "BELIZE", "BENIN", "BERMUDA", "BHUTAN",
        "BOLIVIA", "BOSNIA AND HERZEGOVINA", "BOTSWANA", "BOUVET ISLAND", "BRAZIL", "BRUNEI DARUSSALAM",
        "BULGARIA", "BURKINA FASO", "BURUNDI", "CAMBODIA", "CAMEROON", "CANADA", "CAPE VERDE", "CENTRAL AFRICAN REPUBLIC",
        "CHAD", "CHILE", "CHINA", "COLOMBIA", "COMOROS", "CONGO", "CONGO, DR", "COOK ISLANDS", "COSTA RICA",
        "COTE D'IVOIRE", "CROATIA", "CUBA", "CYPRUS", "CZECH REPUBLIC", "DENMARK", "DJIBOUTI", "DOMINICA",
        "DOMINICAN REPUBLIC", "ECUADOR", "EGYPT", "EL SALVADOR", "EQUATORIAL GUINEA", "ERITREA", "ESTONIA",
        "ETHIOPIA", "FIJI", "FINLAND", "FRANCE", "GABON", "GAMBIA", "GEORGIA", "GERMANY", "GHANA", "GREECE",
        "GRENADA", "GUADELOUPE", "GUATEMALA", "GUINEA", "GUINEA-BISSAU", "GUYANA", "HAITI", "HONDURAS",
        "HUNGARY", "ICELAND", "INDIA", "INDONESIA", "IRAN", "IRAQ", "IRELAND", "ISRAEL", "ITALY", "JAMAICA",
        "JAPAN", "JORDAN", "KAZAKHSTAN", "KENYA", "KIRIBATI", "KOREA, DPR", "KOREA, REPUBLIC", "KUWAIT",
        "KYRGYZSTAN", "LAOS", "LATVIA", "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LITHUANIA", "LUXEMBOURG",
        "MACEDONIA", "MADAGASCAR", "MALAWI", "MALAYSIA", "MALDIVES", "MALI", "MALTA", "MAURITANIA", "MAURITIUS",
        "MEXICO", "MOLDOVA", "MONGOLIA", "MONTENEGRO", "MOROCCO", "MOZAMBIQUE", "MYANMAR", "NAMIBIA", "NEPAL",
        "NETHERLANDS", "NEW ZEALAND", "NICARAGUA", "NIGER", "NIGERIA", "NORWAY", "OMAN", "PAKISTAN", "PANAMA",
        "PAPUA NEW GUINEA", "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "QATAR", "ROMANIA", "RUSSIA",
        "RWANDA", "SAINT KITTS AND NEVIS", "SAINT LUCIA", "SAMOA", "SAO TOME AND PRINCIPE", "SAUDI ARABIA", "SENEGAL",
        "SERBIA", "SEYCHELLES", "SIERRA LEONE", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOLOMON ISLANDS", "SOMALIA",
        "SOUTH AFRICA", "SOUTH SUDAN", "SPAIN", "SRI LANKA", "SUDAN", "SURINAME", "SWAZILAND", "SWEDEN", "SWITZERLAND",
        "SYRIA", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND", "TIMOR-LESTE", "TOGO", "TOKELAU", "TONGA",
        "TRINIDAD AND TOBAGO", "TUNISIA", "TURKEY", "TURKMENISTAN", "UGANDA", "UKRAINE", "UNITED ARAB EMIRATES",
        "UNITED KINGDOM", "UNITED STATES", "URUGUAY", "UZBEKISTAN", "VANUATU", "VATICAN CITY STATE", "VENEZUELA",
        "VIETNAM", "YEMEN", "ZAMBIA", "ZIMBABWE"
    ];

    var context = {
        cgCountries: cgCountries,
        itemCountries: countries.split("; "),
        filteredCountries: []
    };

    _.each(context.itemCountries, function (l) {
        if (_.contains(this.cgCountries, l.toUpperCase())) {
            context.filteredCountries.push(l.toUpperCase());
        }
    }, context);

    return context.filteredCountries.join("; ");
}

function filterType(itemType) {
    var cgTypes = [
        "Audio", "Blog", "Book", "Book Chapter", "Brief", "Brochure", "Case Study", "Conference Paper",
        "Conference Proceedings", "Dataset", "Equation", "Extension Material", "Image", "Journal Article", "Journal Item",
        "Internal Document", "Logo", "Manual", "Manuscript-unpublished", "Map", "Mobile Message", "News Item", "Newsletter",
        "Poster", "Presentation", "Press Item", "Report", "Software", "Source Code", "Template", "Thesis", "Training Material",
        "Video", "Website", "Working Paper", "Wiki"
    ];

    var context = {
        cgTypes: cgTypes,
        itemTypes: itemType.split("; "),
        filteredItemTypes: []
    };

    _.each(context.itemTypes, function (l) {
        if ((_.contains(this.cgTypes, capitalize(l)))) {
            context.filteredItemTypes.push(capitalize(l));
        }
    }, context);

    var filterItemType = context.filteredItemTypes.join("; ");

    return filterItemType || "Other";
}

function filterCRP(crps) {
    var cgCRPs = [
        "DRYLAND SYSTEMS", "HUMIDTROPICS", "AQUATIC AGRICULTURAL SYSTEMS", "GENEBANKS", "POLICIES, INSTITUTIONS, AND MARKETS",
        "WHEAT", "MAIZE", "RICE", "ROOTS, TUBERS AND BANANAS", "GRAIN LEGUMES", "DRYLAND CEREALS", "LIVESTOCK AND FISH",
        "AGRICULTURE FOR NUTRITION AND HEALTH", "WATER, LAND AND ECOSYSTEMS", "FORESTS, TREES AND AGROFORESTRY",
        "CLIMATE CHANGE, AGRICULTURE AND FOOD SECURITY"
    ];


    var context = {
        cgCRPs: cgCRPs,
        itemCRPs: crps.split("; "),
        filteredCRPs: []
    };

    _.each(context.itemCRPs, function (l) {
        // Remove unnecessary portion of name
        l = l.replace("CGIAR Research Program on ", "");
        // Remove abbreviations in brackets from name
        l = l.replace(/ *\([^)]*\) */g, "");
        if (_.contains(this.cgCRPs, l.toUpperCase())) {
            context.filteredCRPs.push(l.toUpperCase());
        }
    }, context);

    return context.filteredCRPs.join("; ");
}

function compoundTitle(title, subTitle){
    title = removeTagsAndSpecialChars(title);
    subTitle = removeTagsAndSpecialChars(subTitle);
    return subTitle.length ? title + ": " + subTitle : title;
}

function updateEndpoint(id, pager) {
    // Update endPoint with received results
    EndPoints.update({_id: id}, {
        $set: {
            pager: {
                start: parseInt(pager.maxrecs) + parseInt(pager.start),
                maxRecords: parseInt(pager.maxrecs),
                total: parseInt(pager.total),
            }
        }
    });
}

function    addItems(endPointId, records, additions, total) {

    _.each(records, function (item) {

        // Check if the items is not in the database
        if (Items.find({itemId: item.dmrecord}).count() == 0) {
            var doc = {
                endPointId: endPointId,
                collection: item.collection.replace("/", ""),
                itemId: parseInt(item.dmrecord),
                title: compoundTitle(item.title, item.subtit),
                authors: item.creato.trim(),
                issuedDate: parseInt(item.date) ? new Date(item.date) : null,
                modifiedDate: new Date(item.dmmodified),
                importedDate: new Date(),
                abstract: removeTagsAndSpecialChars(item.descri),
                seriesName: item.series.trim(),
                seriesNumber: item.seriesa ? item.seriesa.trim() : "",
                publisher: item.publis.trim(),
                place: item.place.trim(),
                citation: removeHTMLTags(item.full),
                language: filterLanguage(item.langua),
                agrovocSubjects: item.loc.toUpperCase(),
                region: filterRegions(item.subjec, true),
                country: filterCountries(item.subjec, false),
                url: "http://ebrary.ifpri.org/cdm/ref/collection/" + item.collection.replace("/", "") + "/id/" + item.dmrecord,
                crp: filterCRP(item.cgiar),
                outputType: filterType(item.type),
                orcid: item.orcid.trim(),
                doi: item.doi.trim()
            };

            Items.insert(doc);
            // increment new items count
            additions++;
            // send progress percentage
            fetchEvent.emit("progress", Meteor.userId(), additions, (additions / total) * 100 + "%");
        }
    }, records);

    return additions;
}

function requestItems(endPoint, additions, fetchAll) {
    var endPointStart = endPoint.pager.start;

    Meteor.http.get(getEndPointURL(endPoint), function (error, results) {
        if (error) throw error;

        if (results.data.records.length) {
            // Update breaking point
            endPointStart = parseInt(results.data.pager.maxrecs) + parseInt(results.data.pager.start);

            // Total number of items to import
            var total = fetchAll ? results.data.pager.total : results.data.records.length;

            updateEndpoint(endPoint._id, results.data.pager);

            additions = addItems(endPoint._id, results.data.records, additions, total);

            if (fetchAll) {
                if (endPointStart > endPoint.pager.total) {
                    // send completed adding items event
                    fetchEvent.emit("complete", Meteor.userId(), additions);
                } else {
                    requestItems(EndPoints.findOne({_id: endPoint._id}), additions, true);
                }
            } else {
                // send completed adding items event
                fetchEvent.emit("complete", Meteor.userId(), additions);
            }
        }
    });
}

Meteor.methods({
    getEndPointItems: function (endPoint, fetchAll) {
        this.unblock();

        var newAdditions = 0;

        requestItems(endPoint, newAdditions, fetchAll);
    }
});