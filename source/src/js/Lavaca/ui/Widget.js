/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(require) {

  var $ = require('$');
  var EventDispatcher = require('lavaca/events/EventDispatcher');
  var uuid = require('lavaca/util/uuid');


  /**
   * @class Lavaca.ui.Widget
   * @super Lavaca.events.EventDispatcher
   * Base type for all UI elements
   *
   * @constructor
   *
   * @param {jQuery} el  The DOM element that is the root of the widget
   */
  var Widget = EventDispatcher.extend(function(el) {
    EventDispatcher.call(this);
    /**
     * @field {jQuery} el
     * @default null
     * The DOM element that is the root of the widget
     */
    this.el = el = $(el);
    var id = el.attr('id');
    if (!id) {
      id = 'widget-' + uuid();
    }
    /**
     * @field {String} id
     * @default (Autogenerated)
     * The el's ID
     */
    this.id = id;
  });


  return Widget;

});
