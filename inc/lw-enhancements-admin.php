<?php

class LW_Enhancements_Admin
{
    public $charset;
    public $tablename;

    function __construct()
    {
        global $wpdb;
        $this->charset = $wpdb->get_charset_collate();
        $this->tablename = $wpdb->prefix . 'requests';
    }

    public function lw_enhancements_menu()
    {
        add_options_page('LocalWiz Enhancements', 'LocalWiz Enhancements', 'manage_options', 'lw-enhancements', array($this, 'lw_enhancements_page'));
    }

    public function lw_enhancements_page()
    { ?>
        <div class="wrap">
            <h2>LocalWiz Enhancements Settings</h2>
            <h3>Credentials</h3>
            <form action="options.php" method="POST">
                <?php
                settings_fields('lw-enhancements-credentials-group');
                do_settings_sections('lw-enhancements');
                submit_button();
                ?>
            </form>
            <h3>Version</h3>
            <p>Version: <?php $this->echo_plugin_version(); ?></p>
        </div>
    <?php }

    public function lw_enhancements_settings()
    {
        // Register settings
        add_settings_section('lw-enhancements-credentials-section', null, null, 'lw-enhancements');

        // Username field
        add_settings_field('lw-enhancements-username', 'API login', array($this, 'usernameHTML'), 'lw-enhancements', 'lw-enhancements-credentials-section');
        register_setting(
            'lw-enhancements-credentials-group',
            'lw-enhancements-username',
            array(
                'sanitize_callback' => 'sanitize_text_field',
                'default' => ''
            )
        );

        // Password field
        add_settings_field('-password', 'API password', array($this, 'passwordHTML'), 'lw-enhancements', 'lw-enhancements-credentials-section');
        register_setting(
            'lw-enhancements-credentials-group',
            'lw-enhancements-password',
            array(
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '1234567890'
            )
        );

        // Use credits field
        add_settings_field('lw-enhancements-use-credits', 'Use credits', array($this, 'useCreditsHTML'), 'lw-enhancements', 'lw-enhancements-credentials-section');
        register_setting(
            'lw-enhancements-credentials-group',
            'lw-enhancements-use-credits',
            array(
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '0'
            )
        );
    }

    // Use credits HTML
    public function useCreditsHTML()
    { ?>
        <select name="lw-enhancements-use-credits" value>
            <option value="0" <?php selected(get_option('lw-enhancements-use-credits'), '0') ?>>False</option>
            <option value="1" <?php selected(get_option('lw-enhancements-use-credits'), '1') ?>>True</option>
        </select>
    <?php }

    // Username HTML
    public function usernameHTML()
    { ?>
        <input type="text" name="lw-enhancements-username" value="<?php echo get_option('lw-enhancements-username'); ?>" />
    <?php }

    // Password HTML
    public function passwordHTML()
    { ?>
        <input type="password" name="lw-enhancements-password" value="<?php echo get_option('lw-enhancements-password'); ?>" />
<?php }

    public function echo_plugin_version()
    {
        $plugin_data = get_plugin_data(CF_PLUGIN_DIR . 'lw-enhancements.php');
        echo $plugin_data['Version'];
    }

    public function lw_enhancements_user_meta()
    {
        add_user_meta(get_current_user_id(), 'lw-enhancements-credits', 1000, true);
    }

    public function zeroBalance()
    {
        update_user_meta(get_current_user_id(), 'lw-enhancements-credits', 50);
    }

    public function init_db()
    {
        error_log('init_db function was called');

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta("CREATE TABLE $this->tablename (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            request_type varchar(255) NOT NULL DEFAULT '',
            file_name varchar(255) NOT NULL DEFAULT '',
            csv_url varchar(255) NOT NULL DEFAULT '',
            cost bigint(20) unsigned NOT NULL,
            PRIMARY KEY  (id)
        ) $this->charset;");
    }
}
