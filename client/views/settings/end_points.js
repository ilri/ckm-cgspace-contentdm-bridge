editEndPoint = new ReactiveVar();
selectedEndPoint = new ReactiveVar();

var floatLabels = function () {
    $("input[type=text]").val($("input").val() + " ");
    $("input[type=number]").val(1);
    $("input").trigger("change");
};

var landLabels = function () {
    $("input").val("");
    $("input").trigger("change");
};

Template.endPoints.helpers({
    endPoints: function () {
        return EndPoints.find({}, {sort: {name: 1}});
    },
    selectedRow: function () {
        return selectedEndPoint.get() == this._id ? "selected" : "";
    },
    shortenedURl: function () {
        return getEndPointURL(this).substring(0, 85);
    }
});

Template.endPoints.events({
    "click tbody tr": function (e, t) {
        editEndPoint.set(null);
        if (selectedEndPoint.get() == this._id) {
            selectedEndPoint.set(null);
        } else {
            selectedEndPoint.set(this._id);
        }
    },
    "click input#edit-url": function (e, t) {
        e.stopPropagation();
    },
    "click a.edit-end-point-button": function (e, t) {
        e.stopPropagation();
        e.preventDefault();

        editEndPoint.set(this._id);
        floatLabels();
    },
    "click a.delete-end-point-button": function (e, t) {
        e.stopPropagation();
        e.preventDefault();

        editEndPoint.set(this._id);
        floatLabels();

        $('#delete-end-point-modal').modal('show');
    },
    "click input#edit-url": function (e, t) {
        e.stopPropagation();
    },
    "keyup input#edit-url": function (e, t) {
        var newUrl = e.target.value.replace("#", "");
        if (e.which === 13) { // Submit change
            if (newUrl) {
                EndPoints.update({_id: this._id}, {$set: {url: newUrl.trim()}});
            } else {
                EndPoints.update({_id: this._id}, {$unset: {url: 1}}); // remove url field
            }
            editEndPoint.set(null);
        } else if (e.keyCode == 27) { // Undo change
            editEndPoint.set(null);
        }
    },
    "blur input#edit-url": function (e, t) {
        editEndPoint.set(null);
    },
});

Template.endPointsForm.onRendered(function () {
    $.material.init();
});

Template.endPointsForm.helpers({
    endPoint: function () {
        return editEndPoint.get() ? EndPoints.findOne({_id: editEndPoint.get()}) : {};
    },
    formTitle: function () {
        return editEndPoint.get() ? "Edit End Point" : "Add new End Point";
    },
    buttonIcon: function () {
        return editEndPoint.get() ? "fa-save" : "fa-plus";
    },
    buttonText: function () {
        return editEndPoint.get() ? "Save Endpoint" : "Add Endpoint";
    },
    selectedEndPointName: function () {
        return EndPoints.findOne({_id: editEndPoint.get()}).name;
    }
});

Template.endPointsForm.events({
    "click button#cancel-action": function (e) {
        e.stopPropagation();
        e.preventDefault();

        editEndPoint.set(null);
        landLabels();
    },
    "submit #end-points-form": function (e) {
        e.preventDefault();

        var newEndPoint = {
            name: e.target.elements.endPointName.value,
            collection: e.target.elements.endPointCollection.value,
            searchString: e.target.elements.endPointSearchString.value,
            fields: e.target.elements.endPointFields.value,
            sort: e.target.elements.endPointSort.value,
            pager: {
                maxRecords: e.target.elements.endPointMaxRecords.value,
                start: e.target.elements.endPointStart.value
            }
        };

        // @TODO: Validate document
        if (editEndPoint.get()) {
            EndPoints.update({_id: editEndPoint.get()}, {
                $set: {
                    name: newEndPoint.name,
                    collection: newEndPoint.collection,
                    searchString: newEndPoint.searchString,
                    fields: newEndPoint.fields,
                    sort: newEndPoint.sort,
                    "pager.maxRecords": newEndPoint.pager.maxRecords,
                    "pager.start": newEndPoint.pager.start
                }
            });
            editEndPoint.set(null);
        } else {
            EndPoints.insert(newEndPoint);
        }

        // Clear form
        landLabels();
    }
});

Template.deleteEndPointModal.events({
    "click #delete-end-point": function (e) {
        e.preventDefault();

        EndPoints.remove({_id: editEndPoint.get()}, function(error){
            if(error) throw error;

            editEndPoint.set(null);
            $('#delete-end-point-modal').modal('hide');
        });
    }
});