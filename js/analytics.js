(function () {
  var tag = $('script[data-mixpanel-id]');

  if (!tag) {
    return;
  }

  // Don't track on edit mode
  if (Fliplet.Env.get('interact')) {
    return;
  }

  var widgetId = tag.data('mixpanel-id');
  var widgetUuid = tag.data('mixpanel-uuid');
  var trackerData = Fliplet.Widget.getData(widgetId);
  var trackerToken = trackerData[Fliplet.Env.get('platform') === 'web' ? 'webTracker' : 'nativeTracker'];
  var eventsStorageKey = 'mixpanel-events-' + widgetUuid;
  var propertiesStorageKey = 'mixpanel-properties-' + widgetUuid;  // Used to store super properties

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
          return Fliplet.Storage.set(eventsStorageKey, trackings);
        })
    }

    var category = data.category;
    delete data.category;

    // Get super properties and track the event
    return Fliplet.Storage.get(propertiesStorageKey)
      .then(function mixpanelTrackEvent(properties) {
        mixpanel.track(category, _.assignIn(data, properties));
        return Promise.resolve();
      });
  }

  // Register a set of super properties, which are included with all events.
  function register(data) {
    return Fliplet.Storage.set(propertiesStorageKey, data);
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

      // Subscribe to other hooks than Analytics
      Fliplet.Hooks.on('onVerified', function(data) {
        if (!data || !data.id) {
          return;
        }

        mixpanel.identify(data.id);

        if (data.entry) {
          mixpanel.people.set(data.entry);
        }
        
        console.log('[Hook] onVerified', data);
      });
    });
})();
