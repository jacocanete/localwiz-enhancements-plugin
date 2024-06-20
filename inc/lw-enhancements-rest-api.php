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

        // register_rest_route(
        //     'localwiz-enhancements/v1',
        //     'citation-finder-test',
        //     array(
        //         'methods' => WP_REST_SERVER::READABLE,
        //         'callback' => array($this, 'citation_finder_test'),
        //     )
        // );

        // Local: http://gosystem7.local/wp-json/localwiz-enhancements/v1/citation-finder-test
        // Prod: http://app.gosystem7.com/wp-json/localwiz-enhancements/v1/citation-finder-test

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
            'localwiz-enhancements/v2',
            'backlinks-explorer',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'backlinks_explorer_v2'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        register_rest_route(
            'localwiz-enhancements/v3',
            'backlinks-explorer',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'backlinks_explorer_v3'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        // register_rest_route(
        //     'localwiz-enhancements/v1',
        //     'backlinks-explorer-test',
        //     array(
        //         'methods' => WP_REST_SERVER::READABLE,
        //         'callback' => array($this, 'backlinks_explorer_test'),
        //     )
        // );

        // Local: http://gosystem7.local/wp-json/localwiz-enhancements/v1/backlinks-explorer-test
        // Prod: http://app.gosystem7.com/wp-json/localwiz-enhancements/v1/backlinks-explorer-test

        register_rest_route(
            'localwiz-enhancements/v1',
            'ranked-keywords',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'ranked_keywords'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        register_rest_route(
            'localwiz-enhancements/v2',
            'ranked-keywords',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'ranked_keywords_v2'),
                'permission_callback' => array($this, 'verify_nonce')
            )
        );

        // register_rest_route(
        //     'localwiz-enhancements/v1',
        //     'ranked-keywords-test',
        //     array(
        //         'methods' => WP_REST_SERVER::READABLE,
        //         'callback' => array($this, 'ranked_keywords_test'),
        //     )
        // );

        // Local: http://gosystem7.local/wp-json/localwiz-enhancements/v1/ranked-keywords-test
        // Prod: http://app.gosystem7.com/wp-json/localwiz-enhancements/v1/ranked-keywords-test

        register_rest_route(
            'localwiz-enhancements/v1',
            'instant-pages',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'instant_pages'),
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

        register_rest_route(
            'localwiz-enhancements/v1',
            'get-csv',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'get_csv'),
            )
        );

        register_rest_route(
            'localwiz-enhancements/v1',
            'upload-csv',
            array(
                'methods' => WP_REST_SERVER::CREATABLE,
                'callback' => array($this, 'upload_csv'),
            )
        );
    }

    public function verify_nonce(WP_REST_Request $request)
    {
        error_log('verify_nonce called');

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
        error_log('citation-finder called');

        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        if ($useCredits) {
            $user_id = get_current_user_id();
            $meta_key = 'lw-enhancements-credits';
            $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

            // Assuming a default cost as we don't know the actual cost before the request
            $defaultCost = 0.1;

            if ($credits_balance < $defaultCost) {
                return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
            }
        }

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

        // Check if the user has enough credits
        $user_id = get_current_user_id();
        $meta_key = 'lw-enhancements-credits';
        $credits_balance = get_user_meta($user_id, $meta_key, true);

        $credits_balance = floatval($credits_balance);

        if (!isset($responseArray['cost'])) {
            return new WP_Error('cost_error', "Cost not found", array('status' => 500));
        }

        $cost = $responseArray['cost'] * 5;

        if ($useCredits) {
            $credits_balance -= $cost;
            update_user_meta($user_id, $meta_key, $credits_balance);
        }

        wp_send_json($responseArray);
    }

    // public function citation_finder_test($keyword)
    // {
    //     error_log('citation-finder-test called');

    //     // Check if the user wants to use credits or not
    //     $useCredits = get_option('lw-enhancements-use-credits') == '1';

    //     if ($useCredits) {
    //         $user_id = 1;
    //         $meta_key = 'lw-enhancements-credits';
    //         $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

    //         // Assuming a default cost as we don't know the actual cost before the request
    //         $defaultCost = 0.1;

    //         if ($credits_balance < $defaultCost) {
    //             return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
    //         }
    //     }

    //     $curl = curl_init();

    //     $postFields = json_encode(
    //         array(
    //             array(
    //                 "keyword" => "weather control",
    //                 "location_code" => 2840,
    //                 "language_code" => "en",
    //                 "device" => "desktop",
    //                 "os" => "windows",
    //                 "depth" => 100
    //             )
    //         )
    //     );

    //     $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced' : 'https://sandbox.dataforseo.com/v3/serp/google/organic/live/advanced';

    //     curl_setopt_array(
    //         $curl,
    //         array(
    //             CURLOPT_URL => $apiUrl,
    //             CURLOPT_RETURNTRANSFER => true,
    //             CURLOPT_ENCODING => "",
    //             CURLOPT_MAXREDIRS => 10,
    //             CURLOPT_TIMEOUT => 0,
    //             CURLOPT_FOLLOWLOCATION => true,
    //             CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    //             CURLOPT_CUSTOMREQUEST => "POST",
    //             CURLOPT_POSTFIELDS => $postFields,
    //             CURLOPT_HTTPHEADER => array(
    //                 "Authorization: Basic " . base64_encode(get_option('lw-enhancements-username') . ":" . get_option('lw-enhancements-password')),
    //                 "Content-Type: application/json"
    //             ),
    //         )
    //     );

    //     // Execute the request
    //     $response = curl_exec($curl);

    //     // Check for errors
    //     if ($response === false) {
    //         $error = curl_error($curl);
    //         curl_close($curl);
    //         wp_send_json(array('error' => $error));
    //         return;
    //     }

    //     curl_close($curl);

    //     // Decode the response
    //     $responseArray = json_decode($response, true);

    //     // Check if the response is valid JSON
    //     if (json_last_error() !== JSON_ERROR_NONE) {
    //         wp_send_json(array('error' => 'Invalid JSON response'));
    //         return;
    //     }

    //     // // Check if the user has enough credits
    //     // $user_id = get_current_user_id();
    //     // $meta_key = 'lw-enhancements-credits';
    //     // $credits_balance = get_user_meta($user_id, $meta_key, true);

    //     // $credits_balance = floatval($credits_balance);

    //     // if (!isset($responseArray['cost'])) {
    //     //     return new WP_Error('cost_error', "Cost not found", array('status' => 500));
    //     // }

    //     // $cost = $responseArray['cost'] * 0;

    //     // if ($useCredits) {
    //     //     $credits_balance -= $cost;
    //     //     update_user_meta($user_id, $meta_key, $credits_balance);
    //     // }

    //     wp_send_json($responseArray);
    // }

    public function backlinks_explorer($params)
    {
        error_log('backlinks_explorer called');

        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        if ($useCredits) {
            $user_id = get_current_user_id();
            $meta_key = 'lw-enhancements-credits';
            $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

            // Assuming a default cost as we don't know the actual cost before the request
            $defaultCost = 0.1;

            if ($credits_balance < $defaultCost) {
                return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
            }
        }

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
                    "limit" => 1000
                )
            )
        );

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

        error_log('response: ' . print_r($response, true));

        // error_log('responseArray: ' . print_r($responseArray, true));

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json(array('error' => 'Invalid JSON response'));
            return;
        }

        // Check if the user has enough credits
        $user_id = get_current_user_id();
        $meta_key = 'lw-enhancements-credits';
        $credits_balance = get_user_meta($user_id, $meta_key, true);

        $credits_balance = floatval($credits_balance);

        if (!isset($responseArray['cost'])) {
            return new WP_Error('cost_error', "Cost not found", array('status' => 500));
        }

        $cost = $responseArray['cost'] * 5;

        if ($useCredits) {
            $credits_balance -= $cost;
            update_user_meta($user_id, $meta_key, $credits_balance);
        }

        wp_send_json($responseArray);
    }

    public function backlinks_explorer_v2($params)
    {
        $start_time = microtime(true);

        error_log('backlinks_explorer called');

        $total_count = 0;
        $itemsArray = array();
        $responseArray = array();
        $total_time = 0;
        $total_cost = 0;
        $current_item_count = 0;
        $iteration = 0;
        $offset = 0;
        $user_id = get_current_user_id();
        $username = get_option('lw-enhancements-username');
        $password = get_option('lw-enhancements-password');


        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        do {

            if ($useCredits) {
                $meta_key = 'lw-enhancements-credits';
                $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

                // Assuming a default cost as we don't know the actual cost before the request
                $defaultCost = 0.1;

                if ($credits_balance < $defaultCost) {
                    if ($iteration > 0) {
                        break;
                    } else {
                        return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
                        exit;
                    }
                }
            }

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
                        "limit" => 1000,
                        "offset" => $offset
                    )
                )
            );

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
                        "Authorization: Basic " . base64_encode($username . ":" . $password),
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

            $currentResponseArray = json_decode($response, true); // convert JSON to PHP array

            // error_log('currentResponseArray: ' . print_r($currentResponseArray, true));

            $current_item_count += $currentResponseArray['tasks'][0]['result'][0]['items_count']; // 100 -> 200 -> 300 -> 400 -> 500

            $total_count = $currentResponseArray['tasks'][0]['result'][0]['total_count']; // 500

            error_log('current_item_count: ' . print_r($current_item_count, true));
            error_log('total_count: ' . print_r($total_count, true));
            error_log('offset: ' . print_r($offset, true));

            $itemsArray = array_merge($itemsArray, $currentResponseArray['tasks'][0]['result'][0]['items']);
            $total_time += $currentResponseArray['time'];
            $offset = $current_item_count;

            if (json_last_error() !== JSON_ERROR_NONE) {
                wp_send_json(array('error' => 'Invalid JSON response'));
                return;
            }

            $iteration++;

            if (!isset($currentResponseArray['cost'])) {
                return new WP_Error('cost_error', "Cost not found", array('status' => 500));
                exit;
            }

            $cost = $currentResponseArray['cost'] * 5;

            $total_cost += $cost;
        } while ($current_item_count < $total_count); // 100 < 500 == TRUE so loop continues until it reaches 500 < 500

        // Check if the user has enough credits
        $meta_key = 'lw-enhancements-credits';
        $credits_balance = get_user_meta($user_id, $meta_key, true);

        $credits_balance = floatval($credits_balance);

        if ($useCredits) {
            $credits_balance -= $total_cost;
            update_user_meta($user_id, $meta_key, $credits_balance);
        }

        $end_time = microtime(true);

        $execution_time = $end_time - $start_time;

        $responseArray = array(
            'total_count' => $total_count,
            'time' => $total_time,
            'items' => $itemsArray,
            'cost' => $total_cost,
            'execution_time' => $execution_time
        );

        wp_send_json($responseArray);
    }

    public function backlinks_explorer_v3($params)
    {
        $start_time = microtime(true);

        error_log('backlinks_explorer called');

        $total_count = 0;
        $itemsArray = array();
        $responseArray = array();
        $total_time = 0;
        $total_cost = 0;
        $current_item_count = 0;
        $offset = 0;
        $user_id = get_current_user_id();
        $username = get_option('lw-enhancements-username');
        $password = get_option('lw-enhancements-password');

        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        // Initial API call to get the total count and first batch of items
        $initialResponse = $this->backlinks_api_call($params, $offset, $username, $password, $useCredits);

        if ($initialResponse === false) {
            return new WP_Error('initial_request_error', "Initial API request failed", array('status' => 500));
        }

        $currentResponseArray = json_decode($initialResponse, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json(array('error' => 'Invalid JSON response'));
            return;
        }

        $current_item_count += $currentResponseArray['tasks'][0]['result'][0]['items_count'];
        $total_count = $currentResponseArray['tasks'][0]['result'][0]['total_count'];
        $itemsArray = array_merge($itemsArray, $currentResponseArray['tasks'][0]['result'][0]['items']);
        $total_time += $currentResponseArray['time'];
        $cost = $currentResponseArray['cost'] * 5;
        $total_cost += $cost;

        if ($useCredits) {
            $credits_balance = floatval(get_user_meta($user_id, 'lw-enhancements-credits', true));
            if ($credits_balance < $cost) {
                return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
            }
        }

        $offset = $current_item_count;

        // Parallel requests to fetch remaining items
        $mh = curl_multi_init();
        $handles = [];
        while ($current_item_count < $total_count) {
            $ch = $this->init_backlinks_api($params, $offset, $username, $password, $useCredits);
            curl_multi_add_handle($mh, $ch);
            $handles[] = $ch;
            $offset += 1000;
            $current_item_count += 1000;
        }

        // Execute the handles
        $running = null;
        do {
            curl_multi_exec($mh, $running);
            curl_multi_select($mh);
        } while ($running > 0);

        // Collect the responses
        foreach ($handles as $ch) {
            $response = curl_multi_getcontent($ch);
            $currentResponseArray = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                wp_send_json(array('error' => 'Invalid JSON response'));
                return;
            }

            $itemsArray = array_merge($itemsArray, $currentResponseArray['tasks'][0]['result'][0]['items']);
            $total_time += $currentResponseArray['time'];
            $cost = $currentResponseArray['cost'] * 5;
            $total_cost += $cost;

            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }

        curl_multi_close($mh);

        // Deduct credits if applicable
        if ($useCredits) {
            $credits_balance -= $total_cost;
            update_user_meta($user_id, 'lw-enhancements-credits', $credits_balance);
        }

        $end_time = microtime(true);
        $execution_time = $end_time - $start_time;

        $responseArray = array(
            'total_count' => $total_count,
            'time' => $total_time,
            'items' => $itemsArray,
            'cost' => $total_cost,
            'execution_time' => $execution_time
        );

        wp_send_json($responseArray);
    }

    private function backlinks_api_call($params, $offset, $username, $password, $useCredits)
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
                    "limit" => 1000,
                    "offset" => $offset
                )
            )
        );

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
                    "Authorization: Basic " . base64_encode($username . ":" . $password),
                    "Content-Type: application/json"
                ),
            )
        );

        $response = curl_exec($curl);
        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            error_log('cURL error: ' . $error);
            return false;
        }

        curl_close($curl);
        return $response;
    }

    private function init_backlinks_api($params, $offset, $username, $password, $useCredits)
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
                    "limit" => 1000,
                    "offset" => $offset
                )
            )
        );

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
                    "Authorization: Basic " . base64_encode($username . ":" . $password),
                    "Content-Type: application/json"
                ),
            )
        );

        return $curl;
    }


    // public function backlinks_explorer_test($params)
    // {
    //     error_log('backlinks_explorer_test called');

    //     // Check if the user wants to use credits or not
    //     $useCredits = get_option('lw-enhancements-use-credits') == '1';

    //     if ($useCredits) {
    //         $user_id = 1;
    //         $meta_key = 'lw-enhancements-credits';
    //         $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

    //         // Assuming a default cost as we don't know the actual cost before the request
    //         $defaultCost = 0.1;

    //         if ($credits_balance < $defaultCost) {
    //             return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
    //         }
    //     }

    //     $curl = curl_init();

    //     $postFields = json_encode(
    //         array(
    //             array(
    //                 "target" => 'localdominator.co',
    //                 "include_subdomains" => 'true',
    //                 "include_indirect_links" => 'true',
    //                 "backlinks_status_type" => 'all',
    //                 "internal_list_limit" => '10',
    //                 "mode" => 'as_is',
    //             )
    //         )
    //     );

    //     $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/backlinks/backlinks/live' : 'https://sandbox.dataforseo.com/v3/backlinks/backlinks/live';

    //     curl_setopt_array(
    //         $curl,
    //         array(
    //             CURLOPT_URL => $apiUrl,
    //             CURLOPT_RETURNTRANSFER => true,
    //             CURLOPT_ENCODING => '',
    //             CURLOPT_MAXREDIRS => 10,
    //             CURLOPT_TIMEOUT => 0,
    //             CURLOPT_FOLLOWLOCATION => true,
    //             CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    //             CURLOPT_CUSTOMREQUEST => 'POST',
    //             CURLOPT_POSTFIELDS => $postFields,
    //             CURLOPT_HTTPHEADER => array(
    //                 "Authorization: Basic " . base64_encode(get_option('lw-enhancements-username') . ":" . get_option('lw-enhancements-password')),
    //                 "Content-Type: application/json"
    //             ),
    //         )
    //     );

    //     $response = curl_exec($curl);

    //     if ($response === false) {
    //         $error = curl_error($curl);
    //         curl_close($curl);
    //         wp_send_json(array('error' => $error));
    //         return;
    //     }

    //     curl_close($curl);

    //     $responseArray = json_decode($response, true);

    //     if (json_last_error() !== JSON_ERROR_NONE) {
    //         wp_send_json(array('error' => 'Invalid JSON response'));
    //         return;
    //     }

    //     // // Check if the user has enough credits
    //     // $user_id = get_current_user_id();
    //     // $meta_key = 'lw-enhancements-credits';
    //     // $credits_balance = get_user_meta($user_id, $meta_key, true);

    //     // $credits_balance = floatval($credits_balance);

    //     // if (!isset($responseArray['cost'])) {
    //     //     return new WP_Error('cost_error', "Cost not found", array('status' => 500));
    //     // }

    //     // $cost = $responseArray['cost'] * 5;

    //     // if ($useCredits) {
    //     //     $credits_balance -= $cost;
    //     //     update_user_meta($user_id, $meta_key, $credits_balance);
    //     // }

    //     wp_send_json($responseArray);
    // }

    public function ranked_keywords($params)
    {
        error_log('ranked keywords called');

        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        if ($useCredits) {
            $user_id = get_current_user_id();
            $meta_key = 'lw-enhancements-credits';
            $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

            // Assuming a default cost as we don't know the actual cost before the request
            $defaultCost = 0.1;

            if ($credits_balance < $defaultCost) {
                return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
            }
        }

        $curl = curl_init();

        $postFields = json_encode(
            array(
                array(
                    "target" => sanitize_text_field($params['t']),
                    "location_code" => sanitize_text_field($params['loc']),
                    "language_code" => sanitize_text_field($params['lang']), // make this dynamic later
                    "historical_serp_mode" => sanitize_text_field($params['hsm']),
                    "ignore_synonyms" => false,
                    "load_rank_absolute" => false,
                    "limit" => 1000,
                )
            )
        );

        $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live' : 'https://sandbox.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live';

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

        // Check if the user has enough credits
        $user_id = get_current_user_id();
        $meta_key = 'lw-enhancements-credits';
        $credits_balance = get_user_meta($user_id, $meta_key, true);

        $credits_balance = floatval($credits_balance);

        if (!isset($responseArray['cost'])) {
            return new WP_Error('cost_error', "Cost not found", array('status' => 500));
        }

        $cost = $responseArray['cost'] * 5;

        if ($useCredits) {
            $credits_balance -= $cost;
            update_user_meta($user_id, $meta_key, $credits_balance);
        }

        wp_send_json($responseArray);
    }

    public function ranked_keywords_v2($params)
    {
        $start_time = microtime(true);

        error_log('ranked_keywords_v2 called');

        $total_count = 0;
        $itemsArray = array();
        $responseArray = array();
        $total_time = 0;
        $total_cost = 0;
        $current_item_count = 0;
        $offset = 0;
        $user_id = get_current_user_id();
        $username = get_option('lw-enhancements-username');
        $password = get_option('lw-enhancements-password');

        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        // Initial API call to get the total count and first batch of items
        $initialResponse = $this->ranked_keywords_api_call($params, $offset, $username, $password, $useCredits);

        if ($initialResponse === false) {
            return new WP_Error('initial_request_error', "Initial API request failed", array('status' => 500));
        }

        $currentResponseArray = json_decode($initialResponse, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json(array('error' => 'Invalid JSON response'));
            return;
        }

        $current_item_count += $currentResponseArray['tasks'][0]['result'][0]['items_count'];
        $total_count = $currentResponseArray['tasks'][0]['result'][0]['total_count'];
        $itemsArray = array_merge($itemsArray, $currentResponseArray['tasks'][0]['result'][0]['items']);
        $total_time += $currentResponseArray['time'];
        $cost = $currentResponseArray['cost'] * 5;
        $total_cost += $cost;

        if ($useCredits) {
            $credits_balance = floatval(get_user_meta($user_id, 'lw-enhancements-credits', true));
            if ($credits_balance < $cost) {
                return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
            }
        }

        $offset = $current_item_count;

        // Parallel requests to fetch remaining items
        $mh = curl_multi_init();
        $handles = [];
        while ($current_item_count < $total_count) {
            $ch = $this->init_ranked_keywords_api($params, $offset, $username, $password, $useCredits);
            curl_multi_add_handle($mh, $ch);
            $handles[] = $ch;
            $offset += 1000;
            $current_item_count += 1000;
        }

        // Execute the handles
        $running = null;
        do {
            curl_multi_exec($mh, $running);
            curl_multi_select($mh);
        } while ($running > 0);

        // Collect the responses
        foreach ($handles as $ch) {
            $response = curl_multi_getcontent($ch);
            $currentResponseArray = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                wp_send_json(array('error' => 'Invalid JSON response'));
                return;
            }

            $itemsArray = array_merge($itemsArray, $currentResponseArray['tasks'][0]['result'][0]['items']);
            $total_time += $currentResponseArray['time'];
            $cost = $currentResponseArray['cost'] * 5;
            $total_cost += $cost;

            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }

        curl_multi_close($mh);

        // Deduct credits if applicable
        if ($useCredits) {
            $credits_balance -= $total_cost;
            update_user_meta($user_id, 'lw-enhancements-credits', $credits_balance);
        }

        $end_time = microtime(true);
        $execution_time = $end_time - $start_time;

        $responseArray = array(
            'total_count' => $total_count,
            'time' => $total_time,
            'items' => $itemsArray,
            'cost' => $total_cost,
            'execution_time' => $execution_time
        );

        wp_send_json($responseArray);
    }

    private function ranked_keywords_api_call($params, $offset, $username, $password, $useCredits)
    {
        $curl = curl_init();
        $postFields = json_encode(
            array(
                array(
                    "target" => sanitize_text_field($params['t']),
                    "location_code" => sanitize_text_field($params['loc']),
                    "language_code" => sanitize_text_field($params['lang']),
                    "historical_serp_mode" => sanitize_text_field($params['hsm']),
                    "ignore_synonyms" => false,
                    "load_rank_absolute" => false,
                    "limit" => 1000,
                    "offset" => $offset
                )
            )
        );

        $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live' : 'https://sandbox.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live';

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
                    "Authorization: Basic " . base64_encode($username . ":" . $password),
                    "Content-Type: application/json"
                ),
            )
        );

        $response = curl_exec($curl);
        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            error_log('cURL error: ' . $error);
            return false;
        }

        curl_close($curl);
        return $response;
    }

    private function init_ranked_keywords_api($params, $offset, $username, $password, $useCredits)
    {
        $curl = curl_init();
        $postFields = json_encode(
            array(
                array(
                    "target" => sanitize_text_field($params['t']),
                    "location_code" => sanitize_text_field($params['loc']),
                    "language_code" => sanitize_text_field($params['lang']),
                    "historical_serp_mode" => sanitize_text_field($params['hsm']),
                    "ignore_synonyms" => false,
                    "load_rank_absolute" => false,
                    "limit" => 1000,
                    "offset" => $offset
                )
            )
        );

        $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live' : 'https://sandbox.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live';

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
                    "Authorization: Basic " . base64_encode($username . ":" . $password),
                    "Content-Type: application/json"
                ),
            )
        );

        return $curl;
    }

    // public function ranked_keywords_test($params)
    // {
    //     error_log('ranked keywords called');

    //     // Check if the user wants to use credits or not
    //     $useCredits = get_option('lw-enhancements-use-credits') == '1';

    //     if ($useCredits) {
    //         $user_id = 1;
    //         $meta_key = 'lw-enhancements-credits';
    //         $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

    //         // Assuming a default cost as we don't know the actual cost before the request
    //         $defaultCost = 0.1;

    //         if ($credits_balance < $defaultCost) {
    //             return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
    //         }
    //     }

    //     $curl = curl_init();

    //     $postFields = json_encode(
    //         array(
    //             array(
    //                 "target" => 'localdominator.co',
    //                 "location_code" => 2840,
    //                 "language_code" => "en",
    //                 "historical_serp_mode" => 'all',
    //                 "ignore_synonyms" => false,
    //                 "load_rank_absolute" => false,
    //                 "limit" => 100,
    //             )
    //         )
    //     );

    //     $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live' : 'https://sandbox.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live';

    //     curl_setopt_array(
    //         $curl,
    //         array(
    //             CURLOPT_URL => $apiUrl,
    //             CURLOPT_RETURNTRANSFER => true,
    //             CURLOPT_ENCODING => '',
    //             CURLOPT_MAXREDIRS => 10,
    //             CURLOPT_TIMEOUT => 0,
    //             CURLOPT_FOLLOWLOCATION => true,
    //             CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    //             CURLOPT_CUSTOMREQUEST => 'POST',
    //             CURLOPT_POSTFIELDS => $postFields,
    //             CURLOPT_HTTPHEADER => array(
    //                 "Authorization: Basic " . base64_encode(get_option('lw-enhancements-username') . ":" . get_option('lw-enhancements-password')),
    //                 "Content-Type: application/json"
    //             ),
    //         )
    //     );

    //     $response = curl_exec($curl);

    //     if ($response === false) {
    //         $error = curl_error($curl);
    //         curl_close($curl);
    //         wp_send_json(array('error' => $error));
    //         return;
    //     }

    //     curl_close($curl);

    //     $responseArray = json_decode($response, true);

    //     if (json_last_error() !== JSON_ERROR_NONE) {
    //         wp_send_json(array('error' => 'Invalid JSON response'));
    //         return;
    //     }

    //     // // Check if the user has enough credits
    //     // $user_id = get_current_user_id();
    //     // $meta_key = 'lw-enhancements-credits';
    //     // $credits_balance = get_user_meta($user_id, $meta_key, true);

    //     // $credits_balance = floatval($credits_balance);

    //     // if (!isset($responseArray['cost'])) {
    //     //     return new WP_Error('cost_error', "Cost not found", array('status' => 500));
    //     // }

    //     // $cost = $responseArray['cost'] * 0;

    //     // if ($useCredits) {
    //     //     $credits_balance -= $cost;
    //     //     update_user_meta($user_id, $meta_key, $credits_balance);
    //     // }

    //     wp_send_json($responseArray);
    // }

    public function instant_pages($params)
    {
        error_log('instant pages called');

        // Check if the user wants to use credits or not
        $useCredits = get_option('lw-enhancements-use-credits') == '1';

        if ($useCredits) {
            $user_id = get_current_user_id();
            $meta_key = 'lw-enhancements-credits';
            $credits_balance = floatval(get_user_meta($user_id, $meta_key, true));

            // Assuming a default cost as we don't know the actual cost before the request
            $defaultCost = 0.1;

            if ($credits_balance < $defaultCost) {
                return new WP_Error('balance_error', "Insufficient Credits", array('status' => 500));
            }
        }

        $curl = curl_init();

        $postFields = json_encode(
            array(
                array(
                    "url" => sanitize_text_field($params['url']),
                    "check_spell" => false,
                    "disable_cookie_popup" => false,
                    "return_despite_timeout" => false,
                    "load_resources" => false,
                    "enable_javascript" => false,
                    "enable_browser_rendering" => false
                )
            )
        );

        $apiUrl = $useCredits ? 'https://api.dataforseo.com/v3/on_page/instant_pages' : 'https://sandbox.dataforseo.com/v3/on_page/instant_pages';

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

        // Check if the user has enough credits
        $user_id = get_current_user_id();
        $meta_key = 'lw-enhancements-credits';
        $credits_balance = get_user_meta($user_id, $meta_key, true);

        $credits_balance = floatval($credits_balance);

        if (!isset($responseArray['cost'])) {
            return new WP_Error('cost_error', "Cost not found", array('status' => 500));
        }

        $cost = $responseArray['cost'] * 5;

        if ($useCredits) {
            $credits_balance -= $cost;
            update_user_meta($user_id, $meta_key, $credits_balance);
        }

        wp_send_json($responseArray);
    }

    public function get_credits_balance()
    {
        error_log('get_credits_balance called');

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
        error_log('save_csv called');

        global $wpdb;

        $csv_data = $request->get_param('csv_data');
        $request_type = $request->get_param('request_type');
        $cost = $request->get_param('cost');
        $file_name = $request->get_param('file_name');

        if (!isset($csv_data) || !isset($request_type) || !isset($cost)) {
            return new WP_Error('missing_parameters', 'CSV data and request type are required', array('status' => 400));
        }

        $user_id = get_current_user_id();
        $table_name = $this->tablename;

        $data = array(
            'user_id' => $user_id,
            'request_type' => $request_type,
            'file_name' => $file_name,
            'csv_data' => json_encode($csv_data),
            'cost' => $cost,
        );
        $format = array(
            '%d',
            '%s',
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

    public function get_csv(WP_REST_Request $request)
    {
        error_log('get_csv called');

        global $wpdb;

        $table_name = $this->tablename;

        $user_id = get_current_user_id();
        $request_type = $request->get_param('request_type');
        $id = $request->get_param('id');
        // $page_number = $request->get_param('page') ?: 1;


        if ($id) {
            error_log('used id: ' . $id);

            $ourQuery = $wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %s AND id = %s AND request_type = %s", array($user_id, $id, $request_type));
            $results = $wpdb->get_results($ourQuery);

            if ($wpdb->last_error) {
                return new WP_Error('db_select_error', $wpdb->last_error, array('status' => 500));
            }

            wp_send_json(array(
                'status' => 'success',
                'message' => 'CSV data retrieved successfully',
                'data' => $results
            ), 200);
            exit;
        }

        $ourQuery = $wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %s AND request_type = %s ORDER BY id DESC", array($user_id, $request_type));
        $results = $wpdb->get_results($ourQuery);

        $countQuery = $wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE user_id = %s AND request_type = %s", array($user_id, $request_type));
        $totalCount = $wpdb->get_var($countQuery);

        if ($wpdb->last_error) {
            return new WP_Error('db_select_error', $wpdb->last_error, array('status' => 500));
        }

        wp_send_json(array(
            'status' => 'success',
            'message' => 'CSV data retrieved successfully',
            'data' => $results,
            'length' => $totalCount
        ), 200);
        exit;
    }

    public function upload_csv(WP_REST_Request $request)
    {
        global $wpdb;

        // Check if the file is uploaded
        $csv_data = $request->get_param('csv_data');
        if (!isset($csv_data)) {
            return new WP_Error('missing_parameters', 'CSV data is required', array('status' => 400));
        }

        // Check if the request type is set
        $request_type = $request->get_param('request_type');
        if (!isset($request_type)) {
            return new WP_Error('missing_parameters', 'Request type is required', array('status' => 400));
        }

        // Check if the cost is set
        $cost = $request->get_param('cost');
        if (!isset($cost)) {
            return new WP_Error('missing_parameters', 'Cost is required', array('status' => 400));
        }

        error_log('cost: ' . $cost);
        error_log('cost_type: ' . gettype($cost));

        // Check if the file name is set
        $file_name = $request->get_param('file_name');
        if (!isset($file_name)) {
            return new WP_Error('missing_parameters', 'File name is required', array('status' => 400));
        }

        // Decode the base64 CSV data
        $csv_data = base64_decode($csv_data);
        if ($csv_data === false) {
            return new WP_Error('decode_error', 'Failed to decode CSV data.', array('status' => 400));
        }

        // Create a temporary file
        $tmp_file = tempnam(sys_get_temp_dir(), 'csv');
        file_put_contents($tmp_file, $csv_data);

        // Generate a unique file name.
        $upload_file_name =  uniqid() . $file_name . '.csv';

        // Move the temporary file to the WordPress uploads directory.
        $upload_dir = wp_upload_dir();
        $file_path = $upload_dir['path'] . '/' . $upload_file_name;
        rename($tmp_file, $file_path);

        // Insert the uploaded file into the media library.
        $attachment_id = wp_insert_attachment(array(
            'guid'           => $upload_dir['url'] . '/' . $upload_file_name,
            'post_mime_type' => 'text/csv',
            'post_title'     => preg_replace('/\.[^.]+$/', '', $upload_file_name),
            'post_content'   => '',
            'post_status'    => 'inherit'
        ), $file_path);

        // Generate attachment metadata and update the attachment.
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attach_data = wp_generate_attachment_metadata($attachment_id, $file_path);
        wp_update_attachment_metadata($attachment_id, $attach_data);

        // Save the request to the database
        $user_id = get_current_user_id();
        $table_name = $this->tablename;
        $csv_url = $upload_dir['url'] . '/' . $upload_file_name;

        // Ensure the URL is HTTPS
        $csv_url = str_replace("http://", "https://", $csv_url);

        $data = array(
            'user_id' => $user_id,
            'request_type' => $request_type,
            'file_name' => $file_name . '.csv',
            'csv_url' => $csv_url,
            'cost' => $cost,
        );

        $format = array(
            '%d',
            '%s',
            '%s',
            '%s',
            '%f'
        );

        $wpdb->insert($table_name, $data, $format);

        if ($wpdb->last_error) {
            return new WP_Error('db_insert_error', $wpdb->last_error, array('status' => 500));
        }

        return new WP_REST_Response(array(
            'status' => 'success',
            'message' => 'CSV data saved successfully',
            'attachment_id' => $attachment_id,
            'url' => $upload_dir['url'] . '/' . $upload_file_name
        ), 200);
    }
}
