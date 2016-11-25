(function () {
  var tag = $('script[data-mixpanel-id]');

  if (!tag) {
    return;
  }

  var widgetId = tag.data('mixpanel-id');
  var trackerData = Fliplet.Widget.getData(widgetId);
  var trackerToken = trackerData[Fliplet.Env.get('platform') === 'web' ? 'webTracker' : 'nativeTracker'];
  var eventsStorageKey = 'mixpanel-events-' + widgetId;
  var propertiesStorageKey = 'mixpanel-properties-' + widgetId;  // Used to store super properties

  Fliplet.Navigator.onOnline(function trackStored() {
    Fliplet.Storage.get(eventsStorageKey)
      .then(function (trackings) {
        if (!trackings) {
          return;
        }

        Fliplet.Storage.remove(eventsStorageKey).then(function() {
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
      return Fliplet.Storage.get(eventsStorageKey)
        .then(function (trackings) {
          var tracking = {
            type: 'trackEvent',
            data: data
          };

          trackings = trackings || [];
          trackings.push(tracking);
          Fliplet.Storage.set(eventsStorageKey, trackings);
        })
    }

    var category = data.category;
    delete data.category;

    // Get super properties and track the event
    Fliplet.Storage.get(propertiesStorageKey)
      .then(function mixpanelTrackEvent(properties) {
        mixpanel.track(category, _.assignIn(data, properties));
      });
  }

  // Register a set of super properties, which are included with all events.
  function register(data) {
    Fliplet.Storage.set(propertiesStorageKey, data);
  }

  Fliplet.Navigator.onReady()
    .then(function () {
      mixpanel.init(trackerToken);
      Fliplet.Analytics.subscribe('trackEvent', trackEvent);
      Fliplet.Analytics.subscribe('pageView', function (data) {
        data.category = 'screen view';
        trackEvent(data);
      });
      Fliplet.Analytics.subscribe('info', register);
    });
})();
