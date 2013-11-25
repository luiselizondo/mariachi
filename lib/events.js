/**
 * @file require the events emitter and instantiate a new class
 * for all events, we need it instantiated so we can communicate throught the application
 * with the same class, we just require this file and start using event listeners and emitters
 */

var EventEmitter = require('events').EventEmitter
  , events = new EventEmitter();

exports.events = events;