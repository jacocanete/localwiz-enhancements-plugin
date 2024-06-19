<?php
class LW_Enhancements_Public
{
    // Register the block
    function lw_enhancements_block_init()
    {
        register_block_type(CF_PLUGIN_DIR . '/build/backlinks-explorer');
        register_block_type(CF_PLUGIN_DIR . '/build/citation-finder');
        register_block_type(CF_PLUGIN_DIR . '/build/ranked-keywords');
        register_block_type(CF_PLUGIN_DIR . '/build/page-audit');
        register_block_type(CF_PLUGIN_DIR . '/build/domain-overview');
        register_block_type(CF_PLUGIN_DIR . '/build/credits');
        register_block_type(CF_PLUGIN_DIR . '/build/results');
    }

    function init_block_styles()
    {
        wp_enqueue_style('bootstrap-css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
        wp_enqueue_script('bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', array('jquery'), null, true);
    }

    function init_block_scripts()
    {
        $site_url = array(
            'root_url' => get_site_url(),
            'nonce' => wp_create_nonce('wp_rest')
        );

        $auth = array(
            'register_url' => esc_url(site_url('/wp-signup.php')),
            'logout_url' => wp_logout_url(),
            'logged_in' => is_user_logged_in(),
        );

        wp_localize_script('lw-enhancements-backlink-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-citation-finder-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-ranked-keywords-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-page-audit-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-domain-overview-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-credits-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-results-view-script', 'site_url', $site_url);
        wp_localize_script('lw-enhancements-credits-view-script', 'auth', $auth);
    }


    function remove_header_footer_css()
    {
        if (has_block('lw-enhancements/backlinks-explorer') || has_block('lw-enhancements/ranked-keywords') || has_block('lw-enhancements/citation-finder') || has_block('lw-enhancements/credits') || has_block('lw-enhancements/results')) {
            echo '<style>
            header { display: none; }
            footer { display: none; }
            </style>';
        }
    }
}
