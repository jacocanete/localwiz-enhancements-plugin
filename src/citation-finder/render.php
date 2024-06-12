<?php

/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>
<div class="citation-finder-update">
	<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true">
	</span>
</div>

<?php
add_action('wp_enqueue_scripts', 'init_block_styles');
add_action('wp_head', 'remove_header_footer_css');

function init_block_styles()
{
	$site_url = array(
		'root_url' => get_site_url(),
		'nonce' => wp_create_nonce('wp_rest')
	);

	wp_enqueue_style('bootstrap-css', 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css');

	wp_enqueue_script('bootstrap-js', 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js', array('jquery'), null, true);

	wp_localize_script('lw-enhancements-citation-finder-view-script', 'site_url', $site_url);
}

function remove_header_footer_css()
{
	echo '<style>
		header { display: none; }
		footer { display: none; }
	</style>';
}
?>