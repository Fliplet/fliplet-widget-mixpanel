(function () {
  var tag = $('script[data-mixpanel-id]');

  if (!tag) {
    return;
  }

  var widgetId = tag.data('mixpanel-id');
  var trackerData = Fliplet.Widget.getData(widgetId);
  var trackerToken = trackerData[Fliplet.Env.get('platform') === 'web' ? 'webTracker' : 'nativeTracker'];
  var storageKey = 'mixpanel' + widgetId;

  Fliplet.Navigator.onOnline(function trackStored() {
    Fliplet.Storage.get(storageKey)
      .then(function (trackings) {
        if (!trackings) {
          return;
        }

        Fliplet.Storage.remove(storageKey).then(function() {
          trackings.forEach(function (tracking) {
            switch (tracking.type) {
              case 'trackEvent':
                delete tracking.type;
                trackEvent(tracking.data);
                break;
            }
          });
        });
      });
  });
  
  function trackEvent(data) {
    if (!data.category) {
      return;
    }
    
    if (!Fliplet.Navigator.isOnline()) {
      return Fliplet.Storage.get(storageKey)
        .then(function (trackings) {
          var tracking = {
            type: 'trackEvent',
            data: data
          };

          trackings = trackings || [];
          trackings.push(tracking);
          Fliplet.Storage.set(storageKey, trackings);
        })
    }

    var category = data.category;
    delete data.category;
    mixpanel.track(category, data);
  }

  Fliplet.Navigator.onReady()
    .then(function () {
      mixpanel.init(trackerToken);
      Fliplet.Analytics2.subscribe('trackEvent', trackEvent)
    });
})();
