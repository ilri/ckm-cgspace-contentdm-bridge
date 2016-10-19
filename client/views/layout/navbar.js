Template.navbar.helpers({
  username: function(){
    return Meteor.user().username;
  }
});
