<?php
class LW_Enhancements_Loader
{
    protected $admin;
    protected $public;
    protected $rest_api;

    public function __construct()
    {
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->define_rest_api_hooks();
        // this->set_locale(); // Not implemented (soon to be implemented)
    }

    private function load_dependencies()
    {
        require_once CF_PLUGIN_DIR . 'inc/lw-enhancements-admin.php';
        require_once CF_PLUGIN_DIR . 'inc/lw-enhancements-public.php';
        require_once CF_PLUGIN_DIR . 'inc/lw-enhancements-rest-api.php';
    }

    private function define_admin_hooks()
    {
        $this->admin = new LW_Enhancements_Admin();
        add_action('admin_menu', array($this->admin, 'lw_enhancements_menu'));
        add_action('admin_init', array($this->admin, 'lw_enhancements_settings'));
        add_action('user_register', array($this->admin, 'lw_enhancements_user_meta')); // use 'user_register' instead of 'admin_init'
        add_action('admin_init', array($this->admin, 'init_db'));
        // add_action('admin_init', array($this->admin, 'zeroBalance'));
    }

    private function define_public_hooks()
    {
        $this->public = new LW_Enhancements_Public();
        add_action('init', array($this->public, 'lw_enhancements_block_init'));
        add_action('wp_enqueue_scripts', array($this->public, 'init_block_styles'));
        add_action('wp_enqueue_scripts', array($this->public, 'init_block_scripts'));
        add_action('wp_head', array($this->public, 'remove_header_footer_css'));
    }

    private function define_rest_api_hooks()
    {
        $this->rest_api = new LW_Enhancements_REST_API();
        add_action('rest_api_init', array($this->rest_api, 'register_routes'));
    }

    public function run()
    {
        // Put any code here that needs to be executed to fully initialize the plugin.
        // For now, leave it empty if there's nothing additional needed.
    }
}
