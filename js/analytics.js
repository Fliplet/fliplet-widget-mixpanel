(function () {
  var tag = $('script[data-mixpanel-id]');

  if (!tag) {
    return;
  }

  var trackerData = Fliplet.Widget.getData(tag.data('mixpanel-id'));
  var trackerToken = trackerData[Fliplet.Env.get('platform') === 'web' ? 'webTracker' : 'nativeTracker'];

  Fliplet.Navigator.onReady().then(function () {
      mixpanel.init(trackerToken, { persistence: 'localStorage'});
      mixpanel.track("Track test");
    });
})();