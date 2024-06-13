<?php
class LW_Enhancements_REST_API
{

    public $charset;
    public $tablename;

    public function __construct()
    {
        global $wpdb;
        $this->charset = $wpdb->get_charset_collate();
        $this->tablename = $wpdb->prefix . 'requests';
    }

    public function register_routes()
    {
        register_rest_route(
            'localwiz-enhancements/v1',
            'citation-finder',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'citation_finder'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        register_rest_route(
            'localwiz-enhancements/v1',
            'backlinks-explorer',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'backlinks_explorer'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        register_rest_route(
            'localwiz-enhancements/v1',
            'credits',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'get_credits_balance'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        register_rest_route(
            'localwiz-enhancements/v1',
            'save-csv',
            array(
                'methods' => WP_REST_SERVER::CREATABLE,
                'callback' => array($this, 'save_csv'),
            )
        );
    }

    public function verify_nonce(WP_REST_Request $request)
    {
        $headers = $request->get_headers();
        if (isset($headers['x_wp_nonce'])) {
            $nonce = $headers['x_wp_nonce'][0];
            if (wp_verify_nonce($nonce, 'wp_rest')) {
                return true;
            } else {
                error_log("Nonce received: " . $nonce);
                return new WP_Error('rest_forbidden', "Invalid nonce: $nonce", array('status' => 403));
            }
        }
        error_log("No nonce received");
        return new WP_Error('rest_forbidden', "Nonce not received", array('status' => 403));
    }

    public function citation_finder($keyword)
    {
        $curl = curl_init();

        $postFields = json_encode(
            array(
                array(
                    "keyword" => sanitize_text_field($keyword['kw']),
                    "location_code" => 2840,
                    "language_code" => "en",
                    "device" => "desktop",
                    "os" => "windows",
                    "depth" => 100
                )
            )
        );

        // Check if the user wants to use credits or not
        $useCredits = false;

        if (get_option('lw-enhancements-use-credits') == '1') {
            $useCredits = true;
        } else {
            $useCredits = false;
        }

        $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced' : 'https://sandbox.dataforseo.com/v3/serp/google/organic/live/advanced';

        curl_setopt_array(
            $curl,
            array(
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => $postFields,
                CURLOPT_HTTPHEADER => array(
                    "Authorization: Basic " . base64_encode(get_option('lw-enhancements-username') . ":" . get_option('lw-enhancements-password')),
                    "Content-Type: application/json"
                ),
            )
        );

        // Execute the request
        $response = curl_exec($curl);

        // Check for errors
        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            wp_send_json(array('error' => $error));
            return;
        }

        curl_close($curl);

        // Decode the response
        $responseArray = json_decode($response, true);

        // Check if the response is valid JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json(array('error' => 'Invalid JSON response'));
            return;
        }

        // Send the response
        wp_send_json($responseArray);
    }

    public function backlinks_explorer($params)
    {
        $curl = curl_init();

        $postFields = json_encode(
            array(
                array(
                    "target" => sanitize_text_field($params['t']),
                    "include_subdomains" => sanitize_text_field($params['is']),
                    "include_indirect_links" => sanitize_text_field($params['iil']),
                    "backlinks_status_type" => sanitize_text_field($params['bst']),
                    "internal_list_limit" => sanitize_text_field($params['ill']),
                    "mode" => sanitize_text_field($params['m']),
                )
            )
        );

        // Check if the user wants to use credits or not
        $useCredits = false;

        if (get_option('lw-enhancements-use-credits') == '1') {
            $useCredits = true;
        } else {
            $useCredits = false;
        }

        $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/backlinks/backlinks/live' : 'https://sandbox.dataforseo.com/v3/backlinks/backlinks/live';

        curl_setopt_array(
            $curl,
            array(
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => $postFields,
                CURLOPT_HTTPHEADER => array(
                    "Authorization: Basic " . base64_encode(get_option('lw-enhancements-username') . ":" . get_option('lw-enhancements-password')),
                    "Content-Type: application/json"
                ),
            )
        );

        $response = curl_exec($curl);

        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            wp_send_json(array('error' => $error));
            return;
        }

        curl_close($curl);

        $responseArray = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json(array('error' => 'Invalid JSON response'));
            return;
        }

        wp_send_json($responseArray);
    }

    public function get_credits_balance()
    {
        $user_id = get_current_user_id();
        $meta_key = 'lw-enhancements-credits';
        $credits_balance = get_user_meta($user_id, $meta_key, true);

        $credits_balance = floatval($credits_balance);

        if ($credits_balance !== false) {
            $response = new WP_REST_Response(array(
                'status' => 'success',
                'message' => 'Credits balance retrieved successfully',
                'balance' => $credits_balance
            ));
            $response->set_status(200);
        } else {
            $response = new WP_REST_Response(array(
                'status' => 'error',
                'message' => 'Failed to retrieve credits balance',
                'balance' => $credits_balance
            ));
            $response->set_status(500);
        }
        return $response;
    }

    public function save_csv(WP_REST_Request $request)
    {
        global $wpdb;

        $csv_data = $request->get_param('csv_data');
        $request_type = $request->get_param('request_type');
        $cost = $request->get_param('cost');

        error_log("CSV data: " . json_encode($csv_data));
        error_log("Request type: " . json_encode($request_type));

        if (!isset($csv_data) || !isset($request_type) || !isset($cost)) {
            return new WP_Error('missing_parameters', 'CSV data and request type are required', array('status' => 400));
        }

        $user_id = get_current_user_id();
        $table_name = $this->tablename;

        $data = array(
            'user_id' => $user_id,
            'request_type' => $request_type,
            'csv_data' => json_encode($csv_data),
            'cost' => $cost,
        );
        $format = array(
            '%d',
            '%s',
            '%s',
            '%d'
        );

        $wpdb->insert($table_name, $data, $format);

        if ($wpdb->last_error) {
            return new WP_Error('db_insert_error', $wpdb->last_error, array('status' => 500));
        }

        return new WP_REST_Response(array(
            'status' => 'success',
            'message' => 'CSV data saved successfully',
        ), 200);
    }
}
