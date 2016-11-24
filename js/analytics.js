(function () {
  var tag = $('script[data-mixpanel-id]');

  if (!tag) {
    return;
  }

  var trackerData = Fliplet.Widget.getData(tag.data('mixpanel-id'));
  var trackerToken = trackerData[Fliplet.Env.get('platform') === 'web' ? 'webTracker' : 'nativeTracker'];

  function trackEvent(data) {
    if (!data.category) {
      return;
    }

    var category = data.category;
    delete data.category;
    mixpanel.track(category, data);
  }

  Fliplet.Navigator.onReady().then(function () {
      mixpanel.init(trackerToken);
      Fliplet.Analytics2.subscribe('trackEvent', trackEvent)
    });
})();