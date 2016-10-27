trimInput = function (val) {
    return val.replace(/^\s*|\s*$/g, "");
};

cleanOutput = function (val) {
    if (val == undefined) {
        val = "false";
    }
    return val;
};

camelize = function (str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
};


checkEmail = Match.Where(function (email) {
    check(email, String);
    return email.match(/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/);
});

nonEmptyString = Match.Where(function (x) {
    check(x, String);
    return x.length > 0;
});

securePassword = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,14}/);
});

passwordLowercase = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.match(/^(?=.*[a-z])/);
});

passwordUppercase = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.match(/^(?=.*[A-Z])/);
});

passwordNumber = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.match(/^(?=.*\d)/);
});

passwordSpecialCharacter = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.match(/^(?=.*[$@$!%*?&])/);
});

passwordMinLength = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.length > 8;
});

passwordMaxLength = Match.Where(function (password) {
    check(password, nonEmptyString);
    return password.length < 14;
});

getErrorMessage = function (errorObject) {
    var message = "";
    for (var key in errorObject) {
        if (errorObject.hasOwnProperty(key)) {
            message += errorObject[key] + "</br>";
        }
    }
    return message;
};

capitalize = function(text){
    return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

getEndPointURL = function(endPoint){
    return "https://server15738.contentdm.oclc.org/dmwebservices/index.php?q=dmQuery/" +
            endPoint.collection + "/" +
            endPoint.searchString + "/" +
            endPoint.fields + "/" +
            endPoint.sort + "/" +
            endPoint.pager.maxRecords + "/" +
            endPoint.pager.start + "/0/0/0/0/json";

};

Notify = {
    user: function (title, detail, receiverId) {
        // Send notification to User
        var notification = new Notification({
            receiverId: receiverId,
            title: title,
            detail: detail,
            isRead: false
        });
        notification.save();
    },
    admin: function (title, detail) {
        // Send notification to Admin(s)
        var notification = new Notification({
            title: title,
            detail: detail,
            isRead: false
        });
        notification.sendToAdmin();
    }
};