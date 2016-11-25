# Mixpanel App Component
To make sure it tracks offline events you need to use `Fliplet.Analytics`.  
You can use `mixpanel` methods directly although it's not a guarantee that it will track offline events.

##Track an Event
```
Fliplet.Analytics.trackEvent({
  category: 'event name',
  foo: 'your property',
  bar: 'another property'
})
```

##Register a set of super properties 
```
Fliplet.Analytics.info({
  foo: 'a property',
  bar: 'another property'
})
```