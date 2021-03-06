sortField = new ReactiveVar("issuedDate");

Template.items.onCreated(function () {
    this.pagination = new Meteor.Pagination(Items, {
        perPage: 50,
        fields: {
            itemId: 1,
            title: 1,
            issuedDate: 1,
            modifiedDate: 1,
            importedDate: 1,
            url: 1,
            doi: 1
        },
        sort: {
            issuedDate: -1
        }
    });
});

Template.items.helpers({
    templatePagination: function () {
        return Template.instance().pagination;
    },
    items: function () {
        return Template.instance().pagination.getPage();
    }
});

Template.items.events({
    "click table thead th.sortable": function (e, t) {
        t.$("table thead th.active").removeClass("active");
        t.$(e.target).addClass("active");

        sortField.set(t.$(e.target).data("sort-field"));

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

        sortKey = sortField.get();
        sortOption = {};
        sortOption[sortKey] = sortDirection;

        Template.instance().pagination.sort(sortOption);
    }
});

Template.item.helpers({
    issuedOn: function () {
        return this.issuedDate ? moment(this.issuedDate).format('YYYY') : 'N/A';
    },
    importedOn: function () {
        return moment(this.importedDate).format('YYYY-MM-DD');
    },
    itemWithDOI: function () {
        return this.doi ? "with-doi" : "";
    }
});