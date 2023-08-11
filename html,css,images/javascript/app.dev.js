/*!
 * @author: Pojo Team
 */
/* global jQuery, PojoA11yOptions */

( function( $, window, document, undefined ) {
	'use strict';

	var Pojo_Accessibility_App = {
		cache: {
			$document: $( document ),
			$window: $( window )
		},

		cacheElements: function() {
			this.cache.$toolbar = $( '#pojo-a11y-toolbar' );
			this.cache.$toolbarLinks = this.cache.$toolbar.find( 'a.pojo-a11y-toolbar-link' );
			this.cache.$toolbarToolsLinks = this.cache.$toolbar.find( '.pojo-a11y-tools a.pojo-a11y-toolbar-link' );
			this.cache.$btnToolbarToggle = this.cache.$toolbar.find( 'div.pojo-a11y-toolbar-toggle > a' );
			this.cache.$skipToContent = $( '#pojo-a11y-skip-content' );
			this.cache.$body = $( 'body' );
		},

		settings: {
			minFontSize: 120,
			maxFontSize: 200,
			buttonsClassPrefix: 'pojo-a11y-btn-',
			bodyClassPrefix: 'pojo-a11y-',
			bodyFontClassPrefix: 'pojo-a11y-resize-font-',
			storageKey: 'pojo-a11y',
			expires: PojoA11yOptions.save_expiration ? PojoA11yOptions.save_expiration * 36e5 /* hours to ms */ : 43200000 // 12 hours
		},

		variables: {
			currentFontSize: 120,
			currentSchema: null
		},

		activeActions: {},

		buildElements: function() {
			// Move the `toolbar/skip to content` to top
			this.cache.$body.prepend( this.cache.$toolbar );
			this.cache.$body.prepend( this.cache.$skipToContent );
		},

		bindEvents: function() {
			var $self = this;

			$self.cache.$btnToolbarToggle.on( 'click', function( event ) {
				event.preventDefault();

				$self.cache.$toolbar.toggleClass( 'pojo-a11y-toolbar-open' );

				if ( $self.cache.$toolbar.hasClass( 'pojo-a11y-toolbar-open' ) ) {
					$self.cache.$toolbarLinks.attr( 'tabindex', '0' );
				} else {
					$self.cache.$toolbarLinks.attr( 'tabindex', '-1' );
				}
			} );

			$( document ).on( 'keyup', function( event ) {
				var TAB_KEY = 9;
				
				if ( TAB_KEY !== event.which || ! $self.cache.$btnToolbarToggle.is( ':focus' ) ) {
					return;
				}
				$self.cache.$toolbar.addClass( 'pojo-a11y-toolbar-open' );
				$self.cache.$toolbarLinks.attr( 'tabindex', '0' );
			} );

			$self.bindToolbarButtons();
		},

		bindToolbarButtons: function() {
			var self = this;

			self.cache.$toolbarToolsLinks.on( 'click', function( event ) {
				event.preventDefault();

				var $this = $( this ),
					action = $this.data( 'action' ),
					actionGroup = $this.data( 'action-group' ),
					deactivate = false;

				if ( 'reset' === action ) {
					self.reset();
					return;
				}

				if ( -1 !== [ 'toggle', 'schema' ].indexOf( actionGroup ) ) {
					deactivate = $this.hasClass( 'active' );
				}

				self.activateButton( action, deactivate );
			} );
		},

		activateButton: function( action, deactivate ) {
			var $button = this.getButtonByAction( action ),
				actionGroup = $button.data( 'action-group' );

			this.activeActions[ action ] = ! deactivate;

			this.actions[ actionGroup ].call( this, action, deactivate );

			this.saveToLocalStorage();
		},

		getActiveButtons: function() {
			return this.cache.$toolbarToolsLinks.filter( '.active' );
		},

		getButtonByAction: function( action ) {
			return this.cache.$toolbarToolsLinks.filter( '.' + this.settings.buttonsClassPrefix + action );
		},

		actions: {
			toggle: function( action, deactivate ) {
				var $button = this.getButtonByAction( action ),
					fn = deactivate ? 'removeClass' : 'addClass';

				if ( deactivate ) {
					$button.removeClass( 'active' );
				} else {
					$button.addClass( 'active' );
				}

				this.cache.$body[ fn ]( this.settings.bodyClassPrefix + action );
			},
			resize: function( action, deactivate ) {
				var oldFontSize = this.variables.currentFontSize;

				if ( 'resize-plus' === action && this.settings.maxFontSize > oldFontSize ) {
					this.variables.currentFontSize += 10;
				}

				if ( 'resize-minus' === action && this.settings.minFontSize < oldFontSize ) {
					this.variables.currentFontSize -= 10;
				}

				if ( deactivate ) {
					this.variables.currentFontSize = this.settings.minFontSize;
				}

				this.cache.$body.removeClass( this.settings.bodyFontClassPrefix + oldFontSize );

				var isPlusActive = 120 < this.variables.currentFontSize,
					plusButtonAction = isPlusActive ? 'addClass' : 'removeClass';

				this.getButtonByAction( 'resize-plus' )[ plusButtonAction ]( 'active' );

				if ( isPlusActive ) {
					this.cache.$body.addClass( this.settings.bodyFontClassPrefix + this.variables.currentFontSize );
				}

				this.activeActions[ 'resize-minus' ] = false;
				this.activeActions[ 'resize-plus' ] = isPlusActive;
				this.cache.$window.trigger( 'resize' );
			},
			schema: function( action, deactivate ) {
				var currentSchema = this.variables.currentSchema;

				if ( currentSchema ) {
					this.cache.$body.removeClass( this.settings.bodyClassPrefix + currentSchema );
					this.getButtonByAction( currentSchema ).removeClass( 'active' );
					this.activeActions[ currentSchema ] = false;

					this.saveToLocalStorage();
				}

				if ( deactivate ) {
					this.variables.currentSchema = null;
					return;
				}

				currentSchema = this.variables.currentSchema = action;
				this.cache.$body.addClass( this.settings.bodyClassPrefix + currentSchema );
				this.getButtonByAction( currentSchema ).addClass( 'active' );
			}
		},

		reset: function() {
			for ( var action in this.activeActions ) {
				if ( this.activeActions.hasOwnProperty( action ) && this.activeActions[ action ] ) {
					this.activateButton( action, true );
				}
			}

			localStorage.removeItem( this.settings.storageKey );
		},

		saveToLocalStorage: function() {
			if ( '1' !== PojoA11yOptions.enable_save ) {
				return;
			}

			if ( ! this.variables.expires ) {
				this.variables.expires = ( new Date() ).getTime() + this.settings.expires;
			}

			var data = {
				actions: this.activeActions,
				variables: {
					currentFontSize: this.variables.currentFontSize,
					expires: this.variables.expires
				}
			};

			localStorage.setItem( this.settings.storageKey, JSON.stringify( data ) );
		},

		setFromLocalStorage: function() {
			if ( '1' !== PojoA11yOptions.enable_save ) {
				return;
			}

			var localData = JSON.parse( localStorage.getItem( this.settings.storageKey ) );
			if ( ! localData ) {
				return;
			}

			var currentDate = new Date(),
				expires = localData.variables.expires;

			if ( currentDate > expires ) {
				localStorage.removeItem( this.settings.storageKey );
				return;
			}

			var actions = localData.actions;

			if ( localData.variables.currentFontSize > 120 ) {
				localData.variables.currentFontSize -= 10;
			}

			$.extend( this.variables, localData.variables );

			for ( var action in actions ) {
				if ( actions.hasOwnProperty( action ) && actions[ action ] ) {
					this.activateButton( action, false );
				}
			}
		},

		handleGlobalOptions: function() {
			if ( '1' === PojoA11yOptions.focusable ) {
				this.cache.$body.addClass( 'pojo-a11y-focusable' );
			}

			if ( '1' === PojoA11yOptions.remove_link_target ) {
				$( 'a[target="_blank"]' ).attr( 'target', '' );
			}

			if ( '1' === PojoA11yOptions.add_role_links ) {
				$( 'a' ).attr( 'role', 'link' );
			}
		},

		init: function() {
			this.cacheElements();
			this.buildElements();
			this.bindEvents();
			this.handleGlobalOptions();
		}
	};

	$( document ).ready( function( $ ) {
		Pojo_Accessibility_App.init();
		Pojo_Accessibility_App.setFromLocalStorage();
	} );

}( jQuery, window, document ) );




<?php
/*
Plugin Name: One Click Accessibility
Plugin URI: https://wpaccessibility.io/?utm_source=wp-plugins&utm_campaign=plugin-uri&utm_medium=wp-dash
Description: The One Click Accessibility toolbar is the fastest plugin to help you make your WordPress website more accessible.
Author: One Click Accessibility
Author URI: https://wpaccessibility.io/?utm_source=wp-plugins&utm_campaign=author-uri&utm_medium=wp-dash
Version: 2.1.0
Text Domain: pojo-accessibility
Domain Path: /languages/
*/
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

define( 'POJO_A11Y__FILE__', __FILE__ );
define( 'POJO_A11Y_BASE', plugin_basename( POJO_A11Y__FILE__ ) );
define( 'POJO_A11Y_URL', plugins_url( '/', POJO_A11Y__FILE__ ) );
define( 'POJO_A11Y_ASSETS_PATH', plugin_dir_path( POJO_A11Y__FILE__ ) . 'assets/' );
define( 'POJO_A11Y_ASSETS_URL', POJO_A11Y_URL . 'assets/' );
define( 'POJO_A11Y_CUSTOMIZER_OPTIONS', 'pojo_a11y_customizer_options' );

final class Pojo_Accessibility {

	/**
	 * @var Pojo_Accessibility The one true Pojo_Accessibility
	 * @since 1.0.0
	 */
	public static $instance = null;

	/**
	 * @var Pojo_A11y_Frontend
	 */
	public $frontend;

	/**
	 * @var Pojo_A11y_Customizer
	 */
	public $customizer;

	/**
	 * @var Pojo_A11y_Settings
	 */
	public $settings;

	/**
	 * @var Pojo_A11y_Admin_UI
	 */
	public $admin_ui;

	public function load_textdomain() {
		load_plugin_textdomain( 'pojo-accessibility' );
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'pojo-accessibility' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'pojo-accessibility' ), '1.0.0' );
	}

	/**
	 * @return Pojo_Accessibility
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function bootstrap() {
		require( 'includes/pojo-a11y-frontend.php' );
		require( 'includes/pojo-a11y-customizer.php' );
		require( 'includes/pojo-a11y-settings.php' );
		require( 'includes/pojo-a11y-admin-ui.php' );

		$this->frontend   = new Pojo_A11y_Frontend();
		$this->customizer = new Pojo_A11y_Customizer();
		$this->settings = new Pojo_A11y_Settings();
		$this->admin_ui = new Pojo_A11y_Admin_UI();
	}

	public function backwards_compatibility() {
		if ( false === get_option( POJO_A11Y_CUSTOMIZER_OPTIONS, false ) ) {
			$customizer_fields = $this->customizer->get_customizer_fields();
			$options = array();
			$mods = get_theme_mods();
			foreach ( $customizer_fields as $field ) {
				if ( isset( $mods[ $field['id'] ] ) ) {
					$options[ $field['id'] ] = $mods[ $field['id'] ];
				} else {
					$options[ $field['id'] ] = $field['std'];
				}
			}
			update_option( POJO_A11Y_CUSTOMIZER_OPTIONS, $options );
		}
	}

	public function add_elementor_support() {
		require( 'includes/pojo-a11y-elementor.php' );

		new Pojo_A11y_Elementor();
	}

	private function __construct() {
		add_action( 'init', array( &$this, 'bootstrap' ) );
		add_action( 'admin_init', array( &$this, 'backwards_compatibility' ) );
		add_action( 'plugins_loaded', array( &$this, 'load_textdomain' ) );

		add_action( 'elementor/init', array( $this, 'add_elementor_support' ) );
	}

}

Pojo_Accessibility::instance();

{
	"name": "pojo-accessibility",
	"slug": "pojo-accessibility",
	"homepage": "http://pojo.me/",
	"description": "",
	"version": "2.1.0",
	"devDependencies": {
		"grunt": "~1.0.2",
		"grunt-checktextdomain": "~1.0.1",
		"grunt-phpunit": "~0.3.6",
		"grunt-wp-readme-to-markdown-with-extra": "~2.2.0",
		"grunt-contrib-jshint": "~1.1.0",
		"grunt-contrib-watch": "~1.0.1",
		"grunt-contrib-uglify": "~3.3.0",
		"grunt-contrib-less": "~1.4.1",
		"grunt-banner": "~0.6.0",
		"grunt-bumpup": "~0.6.3",
		"grunt-shell": "~2.1.0",
		"grunt-text-replace": "~0.4.0",
		"grunt-release": "~0.14.0",
		"grunt-contrib-copy": "~1.0.0",
		"grunt-contrib-clean": "~1.1.0",
		"grunt-wp-deploy": "~1.2.1",
		"matchdep": "~2.0.0"
	}
}