editUrl = new ReactiveVar();
selectedEndPoint = new ReactiveVar();

Template.endPoints.helpers({
    endPoints: function () {
        return EndPoints.find({}, {sort: {name: 1}});
    },
    selectedRow: function () {
        return selectedEndPoint.get() == this._id ? "selected" : "";
    }
});

Template.endPoints.events({
    "click tbody tr": function (e, t) {
        editUrl.set(null);
        if (selectedEndPoint.get() == this._id) {
            selectedEndPoint.set(null);
        } else {
            selectedEndPoint.set(this._id);
        }
    },
    "click input#edit-url": function (e, t) {
        e.stopPropagation();
    },
    "click a.edit-url-button": function (e, t) {
        e.stopPropagation();
        e.preventDefault();
        editUrl.set(this._id);
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
            editUrl.set(null);
        } else if (e.keyCode == 27) { // Undo change
            editUrl.set(null);
        }
    },
    "blur input#edit-url": function (e, t) {
        editUrl.set(null);
    },
});

Template.endPointsForm.onRendered(function () {
    $.material.init();
});

Template.endPointsForm.events({
    "submit #end-points-form": function (e) {
        e.preventDefault();

        var newEndPoint = {
            name: e.target.elements.endPointName.value,
            url: e.target.elements.endPointUrl.value
        };

        // @TODO: Validate document
        EndPoints.insert(newEndPoint);

        // Clear form
        e.target.reset();
    }
});

Template.endPointUrl.helpers({
    editUrlMode: function () {
        return editUrl.get() == this._id;
    },
    shortenURl: function(){
        return this.url.substring(0, 85);
    }
});

Template.endPointUrlEditForm.onRendered(function () {
    $.material.init();
    $("#edit-url").focus();
});