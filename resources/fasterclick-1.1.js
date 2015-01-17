/* Copyright (c) 2015 Jonathan Herman. MIT License. */
/* https://github.com/jdh11235/fasterclick */
/* Fasterclick 1.1 */

(function(){
	'use strict';
	window.Fasterclick = {

		//main method
		attach: function(element, callback) {

			//generate uid to store info in cache with
			var uid = Fasterclick.latest_uid;
			Fasterclick.latest_uid++;

			Fasterclick.cache.exists[uid] = true;

			//construct Function() event wrapper that calls handler with uid
			Fasterclick.cache.touch_handler[uid] = Function('event', 'Fasterclick.touchWrapper(event, "' + uid + '")');

			Fasterclick.cache.click_handler[uid] = Function('event', 'Fasterclick.clickWrapper(event, "' + uid + '")');

			//add references
			Fasterclick.cache.element[uid] = element;
			Fasterclick.cache.callback[uid] = callback;
			Fasterclick.cache.touch_queue[uid] = 0;

			//attach event wrappers to element
			element.addEventListener('touchstart', Fasterclick.cache.touch_handler[uid]);
			element.addEventListener('click', Fasterclick.cache.click_handler[uid]);

			//for use with Fasterclick.cancel(uid);
			return uid;
		},

		cancel: function(uid) {
			if (Fasterclick.cache.exists[uid]) {
				Fasterclick.cache.exists[uid] = false;

				Fasterclick.cache.element[uid].removeEventListener('touchstart', Fasterclick.cache.touch_handler[uid]);
				Fasterclick.cache.element[uid].removeEventListener('click', Fasterclick.cache.click_handler[uid]);

				//remove references
				Fasterclick.cache.callback[uid] = null;
				Fasterclick.cache.touch_queue[uid] = null;
				Fasterclick.cache.element[uid] = null;
				Fasterclick.cache.touch_handler[uid] = null;
				Fasterclick.cache.click_handler[uid] = null;

				return true;
			} else {
				return false;
			}
		},

		//callbacks (user's event handler function)

		//send touch event
		touchWrapper: function(event, uid) {
			Fasterclick.cache.touch_queue[uid]++;
			Fasterclick.cache.callback[uid](event);
		},

		//send click event (only if touch event has not fired first)
		clickWrapper: function(event, uid) {
			if (Fasterclick.cache.touch_queue[uid] > 0) {
				Fasterclick.cache.touch_queue[uid]--;
			} else {
				Fasterclick.cache.callback[uid](event);
			}
		},

		//caches for reference
		cache: {
			callback: [],
			click_handler: [],
			element: [],
			exists: [],
			touch_handler: [],
			touch_queue: []
		},

		//misc. helpers
		latest_uid: 0

	};
})();
