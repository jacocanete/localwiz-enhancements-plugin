<?php

/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>

<div class="container">
	<div class="p-4 border shadow inner d-flex flex-row justify-content-center align-items-center">
		Hi Testing!
	</div>
</div>


<?php
add_action('wp_enqueue_scripts', 'init_block_styles');
add_action('wp_head', 'remove_header_footer_css');

if (!function_exists('init_block_styles')) {
	function init_block_styles()
	{


		wp_enqueue_style('bootstrap-css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');

		wp_enqueue_script('bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', array('jquery'), null, true);
	}

	if (!function_exists('remove_header_footer_css')) {
		function remove_header_footer_css()
		{
			// Your function code here
		}
	}
}
