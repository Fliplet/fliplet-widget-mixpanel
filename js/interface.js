$('form').submit(function (event) {
  event.preventDefault();

  Fliplet.Widget.save({
    trackerName: 'custom',
    webTracker: $('[name="webTracker"]').val(),
    nativeTracker: $('[name="nativeTracker"]').val()
  }).then(function () {
    Fliplet.Widget.complete();
  });
});

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  $('form').submit();
});