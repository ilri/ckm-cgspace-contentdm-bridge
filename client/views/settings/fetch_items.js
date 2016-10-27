isEndPointSelected = new ReactiveVar(false);
selectedEndPoint = new ReactiveVar(null);
newAdditions = new ReactiveVar(0);
fetchAll = new ReactiveVar(true);

fetchEvent.addListener('progress', function (userId, newAdditions, percentage) {
    if (Meteor.userId() == userId) {
        $("#items-imported").text(newAdditions);
        $("#items-progress").css({
            width: percentage
        });
    }
});

fetchEvent.addListener('complete', function (userId, newAdditions) {
    if (Meteor.userId() == userId) {
        toastr.success(newAdditions + " " + pluralize("items", newAdditions) + " imported", "Success!", {
            timeOut: 0,
            "extendedTimeOut": 0
        });
        $("#fetch-items-button").removeClass('disabled').children("i").removeClass("fa-spin");
    }
});

Template.fetchItems.onRendered(function () {
    $.material.init();
});

Template.fetchItems.helpers({
    endPoints: function () {
        return EndPoints.find({}, {sort: {name: 1}});
    },
    isEndPointSelected: function () {
        return isEndPointSelected.get();
    }
});

Template.fetchItems.events({
    "change #endpoint-to-use": function (e, t) {
        if (e.target.value) {
            isEndPointSelected.set(true);
            selectedEndPoint.set(EndPoints.findOne({_id: e.target.value}));
        } else {
            isEndPointSelected.set(false);
            selectedEndPoint.set(null);
        }
    },
    "change #fetch-all": function (e, t) {
        if ($("#fetch-all").prop("checked")) {
            fetchAll.set(true);
        } else {
            fetchAll.set(false);
        }
    },
    "submit form#fetch-items": function (e, t) {
        e.preventDefault();
        t.$("#fetch-items-button").addClass('disabled').children("i").addClass("fa-spin");


        var methodToCall = fetchAll.get() == true ? "getAllEndPointItems" : "getEndPointItems";

        Meteor.call(methodToCall, selectedEndPoint.get(), function (error, updatedEndPoint) {
            if (error) {
                toastr.error(error, "Error while getting items from End Point, please try again!");
                $("#fetch-items-button").removeClass('disabled').children("i").removeClass("fa-spin");
            } else {
                $("#endpoint-to-use").trigger("change");
                toastr.info(
                    "<strong id='items-imported'></strong> End Point items imported." +
                    "<div class='progress'> " +
                    "<div id='items-progress' class='progress-bar progress-bar-success' style='width: 0%''>" +
                    "</div>" +
                    "</div>",
                    "Import in progress!",
                    {
                        timeOut: 0,
                        "extendedTimeOut": 0
                    }
                );
            }
        });
    }
});

Template.endPointStat.helpers({
    selectedEndPoint: function () {
        return selectedEndPoint.get() ? selectedEndPoint.get() : {};
    }
});