Template.registerHelper("latestItemHandle", function () {
    var latestItem = LatestItem.findOne();
    return latestItem ? latestItem.handle : 0;
});