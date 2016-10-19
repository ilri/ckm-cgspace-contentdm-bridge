Meteor.startup(function(){
    // Top-Level Communities of CGSPace
    var communities = [
        {
            name: "Africa RISING"
        },
        {
            name: "AgriFood Chain Toolkit"
        },
        {
            name: "Animal Genetic Resources Virtual Library"
        },
        {
            name: "Bioversity International"
        },
        {
            name: "Center for International Forestry Research (CIFOR)"
        },
        {
            name: "CGIAR Challenge Program on Water and Food (CPWF)"
        },
        {
            name: "CGIAR Gender and Agriculture Research Network"
        },
        {
            name: "CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS)"
        },
        {
            name: "CGIAR Research Program on Dryland Systems"
        },
        {
            name: "CGIAR Research Program on Livestock and Fish"
        },
        {
            name: "CGIAR Research Program on Water, Land and Ecosystems (WLE)"
        },
        {
            name: "CGIAR System-wide Livestock Programme"
        },
        {
            name: "East Africa Dairy Development Project"
        },
        {
            name: "Feed the Future Innovation Lab for Small-Scale Irrigation"
        },
        {
            name: "Humidtropics, a CGIAR Research Program"
        },
        {
            name: "IGAD Livestock Policy Initiative"
        },
        {
            name: "International Center for Agricultural Research in the Dry Areas (ICARDA)"
        },
        {
            name: "International Center for Tropical Agriculture (CIAT)"
        },
        {
            name: "International Institute of Tropical Agriculture (IITA)"
        },
        {
            name: "International Livestock Research Institute (ILRI)"
        },
        {
            name: "International Potato Center (CIP)"
        },
        {
            name: "International Water Management Institute (IWMI)"
        },
        {
            name: "Livestock and Irrigation Value Chains for Ethiopian Smallholders (LIVES)"
        },
        {
            name: "Technical Centre for Agricultural and Rural Cooperation (CTA)"
        },
        {
            name: "Technical Consortium for Building Resilience to Drought in the Horn of Africa"
        }
    ];

    // Add to database if not already available
    _.each(communities, function(community){
        if(Communities.find({name: community.name}).count() == 0){
            Communities.insert(community);
        }
    });

    //Create the Super Administrators user if it does not exist
    if(Meteor.users.find({username: "Admin"}).count() == 0){
        Accounts.createUser({
            username: "Admin",
            password: "P@ssw0rd!"
        });
    }

});
