Meteor.publish("users", function(){
    return Meteor.users.find();
});

Meteor.publish("allItems", function(){
    Counts.publish(this, 'totalItemsCount', Items.Collection.find());
});

Meteor.publish("latestItem", function(){
   return Items.Collection.find({}, {
       sort: {handle: -1},
       limit: 1
   });
});


Meteor.publish("communities", function(){
    return Communities.find();
});

Meteor.publish("endPoints", function(){
    return EndPoints.find();
});