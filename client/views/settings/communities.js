selectedCommunity = new ReactiveVar();

Template.communities.helpers({
    communities: function(){
        return Communities.find({}, {sort: {name: 1}});
    },
    selectedRow: function(){
        return selectedCommunity.get() == this._id ? "selected" : "";
    }
});

Template.communities.events({
    "click tbody tr": function(e, t){
        if(selectedCommunity.get() == this._id){
            selectedCommunity.set(null);
        } else {
            selectedCommunity.set(this._id);
        }
    }
});
