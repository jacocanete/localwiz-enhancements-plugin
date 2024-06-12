<?php
class LW_Enhancements_REST_API
{

    public function register_routes()
    {
        register_rest_route(
            'localwiz-enhancements/v1',
            'citation-finder',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'citation_finder')
            )
        );

        register_rest_route(
            'localwiz-enhancements/v1',
            'backlinks-explorer',
            array(
                'methods' => WP_REST_SERVER::READABLE,
                'callback' => array($this, 'backlinks_explorer')
            )
        );
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
}
