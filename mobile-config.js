App.info({
    name: 'CGSpace ContentDM Bridge',
    description: 'A tool to facilitate ContentDM to CGSpace item import.',
    author: 'ILRI CKM',
    email: 'ilriweb@cgiar.org',
    website: 'https://www.ilri.org/ckm',
    version: '0.1.0'
});

App.icons({
    // iOS
    'iphone_2x': 'resources/icons/icon-60x60@2x.png',
    'ipad': 'resources/icons/icon-76x76.png',
    'ipad_2x': 'resources/icons/icon-76x76@2x.png',

    // Android
    'android_mdpi': 'resources/icons/icon-48x48.png',
    'android_hdpi': 'resources/icons/icon-72x72.png',
    'android_xhdpi': 'resources/icons/icon-96x96.png'
});

App.launchScreens({
    // iOS
    'iphone_2x': 'resources/splash/splash-320x480@2x.png',
    'iphone5': 'resources/splash/splash-320x568@2x.png',
    'ipad_portrait': 'resources/splash/splash-768x1024.png',
    'ipad_portrait_2x': 'resources/splash/splash-768x1024@2x.png',
    'ipad_landscape': 'resources/splash/splash-1024x768.png',
    'ipad_landscape_2x': 'resources/splash/splash-1024x768@2x.png',

    // Android
    'android_mdpi_portrait': 'resources/splash/splash-320x480.png',
    'android_mdpi_landscape': 'resources/splash/splash-480x320.png',
    'android_hdpi_portrait': 'resources/splash/splash-480x800.png',
    'android_hdpi_landscape': 'resources/splash/splash-800x480.png',
    'android_xhdpi_portrait': 'resources/splash/splash-720x1280.png',
    'android_xhdpi_landscape': 'resources/splash/splash-1280x720.png'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#427730');

// Allow access to external links to handles and DOIs
App.accessRule('https://hdl.handle.net/*');
App.accessRule('http://dx.doi.org/*');
App.accessRule('https://twitter.com/*');