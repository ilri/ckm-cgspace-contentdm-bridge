Meteor.publish("users", function(){
    return Meteor.users.find();
});


new Meteor.Pagination(Items);


Meteor.publish("communities", function(){
    return Communities.find();
});

Meteor.publish("endPoints", function(){
    return EndPoints.find();
});