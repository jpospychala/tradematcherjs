var matcher = require('./matcher'),
  storage = require('./pgstorage'),
  util = require('util'),
  events = require('events');

function App() {
  var that = this;
  this.storage = new storage.Storage();
  this.matcher = new matcher.Matcher();
  this.matcher.on('match', function(offer1, offers) {
    that.storage.writeDeal([offer1, offers])
    .then(function() {
      that.emit('match', [offer1, offers]);
    });
  })

  this.start = function() {
    return this.storage.open();
  }

  this.stop = function() {
    return this.storage.close();
  }

  this.offer = function(offer) {
    var that = this;
    return this.storage.writeOffer(offer)
    .then(function() {
      return that.matcher.send(offer);
    })
  }

  this.load = function() {
    var that = this;
    return this.storage.load()
    .then(function(store) {
      that.matcher.offers = store;
    });
  }

  this.clear = function() {
    return this.storage.clear();
  }
}

util.inherits(App, events.EventEmitter);

module.exports = {
  App: App
}
