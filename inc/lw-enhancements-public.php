<?php
class LW_Enhancements_Public
{
    public function __construct()
    {
        // add_action('wp_head', array($this, 'remove_header_footer_css'));
        add_action('init', array($this, 'lw_enhancements_block_init'));
    }

    // Remove header and footer CSS
    public function remove_header_footer_css()
    {
        // Ensure the page_id_to_modify property is available
        if (isset($this->page_id_to_modify) && is_page($this->page_id_to_modify)) {
            echo '<style>
                    header { display: none; }
                    footer { display: none; }
                  </style>';
        }
    }

    // Register the block
    function lw_enhancements_block_init()
    {
        register_block_type(CF_PLUGIN_DIR . '/build/backlinks-explorer');
        register_block_type(CF_PLUGIN_DIR . '/build/citation-finder');
    }
}