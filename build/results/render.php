<?php

/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>
<div class="results-update">
	<div class="container">
		<div class="p-4 border shadow inner">
			<div className="d-flex align-items-center gap-2">
				<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
				Loading saved results...
			</div>
		</div>
	</div>
</div>

<?php
// function print_script_handles()

// {

// 	global $wp_scripts;

// 	foreach ($wp_scripts->queue as $handle) :

// 		echo $handle . ', ';

// 	endforeach;
// }

// add_action('wp_print_scripts', 'print_script_handles');
