Router.configure({
    layoutTemplate: "layout",
    loadingTemplate: "loading"
});

Router.route("/", {
    name: "home",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("home");
            }
        }
    }
});

Router.route("/fetch-items", {
    name: "fetchItems",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("fetchItems");
            }
        }
    }
});

Router.route("/end-points", {
    name: "endPoints",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("endPoints");
            }
        }
    }
});

Router.route("/communities", {
    name: "communities",
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    action: function () {
        if (this.ready()) {
            // Send user to sign in form, if not logged in
            if (!Meteor.userId()) {
                Router.go("/sign_in");
            } else {
                this.render("communities");
            }
        }
    }
});

Router.route("/sign_in", {
    name: "signIn",
    layout: "layoutAnonymous",
    action: function () {
        if (this.ready()) {
            // Render sign in form if the user is not logged in
            if (!Meteor.userId()) {
                this.render("signIn");
            } else {
                Router.go("/");
            }
        }
    }
});

Router.route("/sign_out", {
    name: "signOut",
    action: function () {
        Meteor.logout();
        Router.go("/");
    }
});

Router.route('/oai/request', {
    name: 'oaiRequest', //optional
    where: 'server', //important to make sure that the function is synchronous
    waitOn: function () {
        return [Meteor.subscribe('items'), Meteor.subscribe('endPoints')] ;
    },
    action: function () {
        if (this.ready()) {
            var query = this.params.query;
            var validVerbs = [
                'GetRecord',
                'Identify',
                'ListIdentifiers',
                'ListMetadataFormats',
                'ListRecords',
                'ListSets'
            ];

            // Make sure the verb provided is a valid one
            var validVerb = _.find(validVerbs, function (verb) {
                return verb == query.verb;
            });

            if (validVerb) {
                respondWithXML(query, this.response);
            } else {
                this.response.end('Error! Please specify a correct verb.');
            }
        }
    }
});

function respondWithXML(query, response) {
    var xmlData = Meteor.call("oai" + query.verb, query);
    response.writeHead(200, {'Content-Type': 'application/xml'}); //outputs data to visitor
    response.end(xmlData);
}