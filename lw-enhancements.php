<?php
/**
 * Plugin Name:       LocalWiz Enhancements
 * Description:       LocalWiz Enhancements plugin that introduces new blocks integrated from the DataForSEO API.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Jaco Gagarin Canete
 * Author URI:		  jaco-portfolio.me
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       lw-enhancements
 *
 * @package LwEnhancements
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

// Define constants
define('CF_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CF_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include the core class (core class is responsible for loading all other classes)
require_once CF_PLUGIN_DIR . 'inc/lw-enhancements-loader.php';

function run_citation_finder()
{
	$plugin = new LW_Enhancements_Loader();
	$plugin->run();
}

run_citation_finder();

