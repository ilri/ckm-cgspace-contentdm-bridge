selectedItemsCount = new ReactiveVar(0);
searchFilter = new ReactiveVar({});
searchField = new ReactiveVar("dateIssued");
searchFieldType = new ReactiveVar("date");

$.fn.checkItem = function (check) {
    return this.each(function () {
        if (check) {
            $(this).removeClass("fa-square-o").addClass('fa-check-square-o');
        } else {
            $(this).removeClass("fa-check-square-o").addClass('fa-square-o');
        }
    });
};

getCopy = function (obj) {
    var newObj = {};
    for (var k in obj) newObj[k] = obj[k];
    return newObj;
};

adjustPager = function () {
    if ($(window).width() < 405) {
        Items.set({
            paginationMargin: 0
        });
    } else if ($(window).width() >= 405 && $(window).width() < 768) {
        Items.set({
            paginationMargin: 1
        });
    } else {
        Items.set({
            paginationMargin: 3
        });
    }
};

Template.home.helpers({
    selectedItemsCount: function () {
        return selectedItemsCount.get();
    },
    showDateSearchForm: function () {
        return searchFieldType.get() == "date";
    }
});

Template.home.events({
    "click #advanced-search": function (e, t) {
        if ($("#advanced-search i").hasClass("fa-chevron-circle-down")) {
            $("#advanced-search i")
                .removeClass("fa-chevron-circle-down")
                .addClass("fa-chevron-circle-up");
            $("#search-form").slideDown();
        } else {
            $("#advanced-search i")
                .removeClass("fa-chevron-circle-up")
                .addClass("fa-chevron-circle-down");
            $("#search-form").slideUp();
        }
    },
    "click #all-items": function (e, t) {
        if (t.$(e.target).hasClass("fa-square-o")) {
            t.$("table i.fa-square-o").checkItem(true);
        } else {
            t.$("table i.fa-check-square-o").checkItem(false);
        }
        selectedItemsCount.set(t.$("table tbody tr>td i.fa-check-square-o").length);
    },
    "click i.item-selected": function (e, t) {
        if (t.$(e.target).hasClass("fa-square-o")) {
            t.$(e.target).checkItem(true);
            if ($("table tbody tr>td i.fa-square-o").length == 0) {
                t.$("i#all-items").checkItem(true);
            }
        } else {
            t.$(e.target).checkItem(false);
            t.$("i#all-items").checkItem(false);
        }
        selectedItemsCount.set(t.$("table tbody tr>td i.fa-check-square-o").length);
    },
    "keyup #items-to-fetch": function (e, t) {
        if (e.keyCode == 13) {
            t.$("#fetch-items").trigger("click");
        }
    }
});

Template.home.onRendered(function () {
    $.material.init();
    adjustPager();
    $(window).resize(function () {
        adjustPager();
    });
});

Template.items.events({
    "click table thead th.sortable": function (e, t) {
        t.$("table thead th.active").removeClass("active");
        t.$(e.target).addClass("active");

        searchField.set(t.$(e.target).data("sort-field"));
        searchFieldType.set(t.$(e.target).data("sort-field-type"));

        // Move the sorter to the header
        t.$("#sorter").appendTo(t.$(e.target));

        // Update advanced search "Search By" select
        t.$("select#select-search-field").val(t.$(e.target).data("sort-field"));
        t.$("select#select-search-field").trigger("change");
    },
    "click table thead th.sortable div#sorter": function (e, t) {
        e.stopPropagation();
    },
    "click table thead th.sortable i": function (e, t) {
        e.stopPropagation();
        var sortDirection = 1;

        t.$("i.active").removeClass("active");
        t.$(t.$(e.target)).addClass("active");

        if (t.$(e.target).hasClass("fa-chevron-circle-up")) {
            sortDirection = 1;
        } else {
            sortDirection = -1;
        }

        // Update "Sort By" Advanced Search field
        $("input:radio").prop("checked", false);
        $("input:radio[value="+ sortDirection +"]").prop("checked", true);

        sortKey = searchField.get();
        sortOption = {};
        sortOption[sortKey] = sortDirection;

        Items.set({
            sort: sortOption
        });
    }
});

Template.item.helpers({
    importedOn: function () {
        return moment(this.importedDate).format('YYYY-MM-DD');
    },
    itemWithDOI: function () {
        return this.doi ? "with-doi" : "";
    }
});

Template.searchByForm.events({
    "change select#select-search-field": function (e, t) {
        var selectedSearchBy = e.target.value;
        var selectedFieldType = $("select#select-search-field option:selected").data("sort-field-type");

        $("table thead th.active").removeClass("active");
        $("[data-sort-field='" + selectedSearchBy + "']").addClass("active");

        // Move the sorter to the header
        $("#sorter").appendTo("[data-sort-field='" + selectedSearchBy + "']");

        searchField.set(selectedSearchBy);
        searchFieldType.set(selectedFieldType);


        var sortKey = searchField.get();
        var sortOption = {};
        var sortDirection = parseInt($("input:radio[name=sort]:checked").val(), 10);
        sortOption[sortKey] = sortDirection;

        Items.set({
            sort: sortOption
        });
    }
});

Template.sortByForm.events({
    "change input:radio[name=sort]": function (e, t) {
        var sortDirection = parseInt(e.target.value, 10);

        $("#sorter i.active").removeClass("active");

        if (sortDirection == 1) {
            $("#sorter i.fa-chevron-circle-up").addClass("active");
        } else {
            $("#sorter i.fa-chevron-circle-down").addClass("active");
        }

        sortKey = searchField.get();
        sortOption = {};
        sortOption[sortKey] = sortDirection;

        Items.set({
            sort: sortOption
        });
    }
});

Template.dateSearchForm.events({
    "click #search-items-by-date": function (e, t) {
        var selectedField = searchField.get();
        var searchDateFilter = getCopy(searchFilter.get());

        var afterDateString = t.$("#search-after-date").val().trim();
        var beforeDateString = t.$("#search-before-date").val().trim();

        if (afterDateString == "" && beforeDateString == "") { // no dates picked
            toastr.info("Please pick a date!");
        } else {
            var afterDate, beforeDate = null;


            if (afterDateString != "") {
                afterDate = moment(afterDateString, "YYYY-MM-DD");
            }

            if (beforeDateString != "") {
                beforeDate = moment(beforeDateString, "YYYY-MM-DD");
            }

            if (afterDate && beforeDate) { // search in specified range
                if (beforeDate > afterDate) {
                    searchDateFilter[selectedField] = {
                        $gte: afterDate.toDate(),
                        $lte: beforeDate.toDate()
                    }
                } else {
                    toastr.info("Please make sure your selected date range is correct!");
                }
            } else if (afterDate) {     // search after specified date
                searchDateFilter[selectedField] = {
                    $gte: afterDate.toDate()
                }
            } else if (beforeDate) {   // search before specified date
                searchDateFilter[selectedField] = {
                    $lte: beforeDate.toDate()
                }
            }
        }

        if (searchDateFilter[selectedField]) { // make sure filter is specified
            searchFilter.set(searchDateFilter);
            Items.set({
                filters: searchFilter.get()
            });
        }
    },
    "click #clear-search-items-by-date": function (e, t) {
        var selectedField = searchField.get();
        var searchDateFilter = getCopy(searchFilter.get());

        t.$(".picker").val("");
        delete searchDateFilter[selectedField];
        searchFilter.set(searchDateFilter);
        Items.set({
            filters: searchFilter.get()
        });
    }
});

Template.dateSearchForm.helpers({
    selectedSearchField: function () {
        return searchField.get().match(/[A-Z]*[^A-Z]+/g).join(" ");
    }
});

Template.dateSearchForm.onRendered(function () {
    $.material.init();
});

Template.textSearchForm.helpers({
    selectedSearchField: function () {
        return searchField.get().match(/[A-Z]*[^A-Z]+/g).join(" ");
    }
});

Template.textSearchForm.events({
    "keyup #search-term": function (e, t) {
        var searchTermFilter = getCopy(searchFilter.get());
        var selectedField = searchField.get();

        if (e.keyCode == 13) {
            t.$("#search-items").trigger("click");
        } else if (e.keyCode == 27) {               // ESC key means reset

            e.target.value = "";
            delete searchTermFilter[selectedField];
            searchFilter.set(searchTermFilter);
            Items.set({
                filters: searchFilter.get()
            });
        }
    },
    "click #search-items": function (e, t) {
        var selectedField = searchField.get();
        var searchTerm = t.$("#search-term").val().trim();
        var searchTermFilter = getCopy(searchFilter.get());

        if (!searchTerm) {
            toastr.info("Please type in your search term");
        } else if(selectedField == "handle"){
            Items.set({
                filters: { $where: "/.*"+searchTerm+".*/.test(this.handle)" }
            });
        } else {
            searchTermFilter[selectedField] = {$regex: ".*" + searchTerm + ".*", $options: '-i'};
            searchFilter.set(searchTermFilter);
            Items.set({
                filters: searchFilter.get()
            });
        }
    },
    "click #clear-search-items": function (e, t) {
        var searchTermFilter = getCopy(searchFilter.get());
        var selectedField = searchField.get();

        $("#search-term").val("");
        delete searchTermFilter[selectedField];
        searchFilter.set(searchTermFilter);
        Items.set({
            filters: searchFilter.get()
        });
    }
});

Template.textSearchForm.onRendered(function () {
    $.material.init();
});