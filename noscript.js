/**
 * 
 * jQuery Noscript v0.1
 *
 * Provide some automatic handling of form controls, enable and disable elments based upon other values.
 *
 * Example:
 *	 Cause the input text field named 'fred' to be enbled when 'foo' is selected, when 'bar' is selected
 *	   the input field will be disabled. The values to these two data- attributes are selectors. The more
 *	   generic the selector, the greater possibility for there to be ambiguity in matching the originating
 *	   event. It is up to the caller to make the value selector specific enough to remove ambiguity.
 *
 *	 <select name="foobar">
 *		<option value="foo">foo</option>
 *		<option value="bar">bar</option>
 *	 </select>
 *
 *	 <input name="fred" type="text" data-ns-enable="[name=foobar]" data-ns-value="[value=foo]" >
 *
 * Released under the MIT license:
 *   http://opensource.org/licenses/mit-license.php
 *
 */
(function ( $, window, document ) {
	
	"use strict";

	$.fn.noscript = function() {

		return this.each(function() {

			var t = $ ( this );

			// identify controllers by collecting the selectors from the listeners
			var container = t.is( "form" ) ? t : t.find( "form" ),
				controllers = {},
				triggerTypes = [ "[data-ns-enable]", "[data-ns-show]" ],
				toCamelCase = function(string) {
					// [data-ns-show] --> nsShow
					return string.substring(6, string.length - 1).replace(/([ -]+)([a-zA-Z0-9])/g, function(a,b,c) {
						return c.toUpperCase();
					}).replace(/-/g, "");
				};

			$.each( triggerTypes, function( i, dataSelector ) {

				container.find( dataSelector ).each( function() {

					var enableOn = toCamelCase(dataSelector),
						onTrigger = $( this ).data( enableOn ).split( "," );

					$.each( onTrigger, function( index, selector ) {
						if ( !controllers[ selector ] ) {
							controllers[ selector ] = true;
						}
					});
			
				});
			});

			// Bind change event on all select, checkbox and radio controls
			container.on( "change", "select, input[type=checkbox], input[type=radio]", function( event ) {

				var originator = $( event.currentTarget ),
					changedListeners = [];

				// Handle enable/disable
				container.find( "[data-ns-enable]" ).each( function() {

					$( this ).each( function() {
				
						var listener = $( this ),
							data = listener.data();

						// Is the listener interested in this controller
						if ( originator.is( data.nsEnable ) ) {

							// Set default listener state to disabled.
							var selector = data.nsValue,
								disable = true;

							// If the originator is disabled, the listener should be as well.
							if ( !originator.prop( "disabled" ) ) {
								// When originator is select, match on the selected option.
								if ( originator.is( "select" ) ) {
									disable = !originator.find( "option:selected" ).is( selector );
								} else {
									disable = !originator.is( selector );
								}
							}

							var addToChangedListeners = true;
							if ( listener.is( "tr, td" ) ) {
								listener.toggleClass( "ns-disabled", disable );
							} else {
								// Don't fire a change event for an unchecked radio button
								addToChangedListeners = !listener.is( "[type=radio]" ) || listener.prop( "checked" );
								listener.prop( "disabled", disable );
							}

							if ( addToChangedListeners ) {
								// If this listener is also a controller, keep track so we can trigger a change event
								$.each( controllers, function( selector ) {
									if ( listener.is( selector )) {
										changedListeners.push( listener );
										return false; // break
									}
								});
							}
						}
					});
				});

				// Handle show/hide
				container.find( "[data-ns-show]" ).each( function() {
			
					var listener = $( this ),
						data = listener.data();

					if ( originator.is( data.nsShow ) ) {

						var selector = data.nsValue,
							hide = true;

						// If the originator is disabled, the listener should be as well.
						if ( !originator.prop( "disabled" ) ) {
							if ( originator.is( "select" ) ) {
								// Match on the selected option: <select> --> <option selected>value</option>
								hide = !originator.find( "option:selected" ).is( selector );
							} else {
								hide = !originator.is( selector );
							}
						}

						if ( hide ) {
							listener.hide();
						} else {
							listener.show();
						}
					}
				});

				// At the end of the event fire any controlling listeners
				$.each( changedListeners, function( index, listener ) {
					$( listener ).change();
				});

			});

			// Fire controllers on init to set initial state
			$.each( controllers, function( selector ) {
				// Further iterate on these, a selector for a radio may have more than one match.
				container.find( selector ).each( function() {
					var t = $( this );
					if ( !t.prop( "disabled" ) ) {
						if ( t.is( "[type=radio]" ) ) {
							if ( t.is( ":checked" ) ) {
								t.change();
							}
						} else {
							t.change();
						}
					}
				});
			});

			// Handle setting focus for first match of ns-focus
			container.find( "[ns-focus]" ).filter( ":first" ).focus();
		});

	};

	// Plugin is automatically initialized by adding 'noscript' to the form element.
	// Optionally the user can manually initialize by calling $( form ).noscript();
	$( document ).ready( function() {
		$( "body" ).find( "form[noscript]" ).noscript();
	});

}( jQuery, window, document ));

