<?php
class LW_Enhancements_REST_API
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

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
        curl_close($curl);

        // Decode the response
        $responseArray = json_decode($response, true);

        // Send the response
        wp_send_json($responseArray);
    }

    public function backlinks_explorer($target)
    {
        $curl = curl_init();

        curl_setopt_array(
            $curl,
            array(
                CURLOPT_URL => 'https://sandbox.dataforseo.com/v3/backlinks/backlinks/live',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => '[
                {"target":"dataforseo.com", "internal_list_limit":10, "backlinks_status_type":"live", "include_subdomains":true, "include_indirect_links":true}
            ]',
                CURLOPT_HTTPHEADER => array(
                    "Authorization: Basic " . base64_encode(get_option('lw-enhancements-username') . ":" . get_option('lw-enhancements-password')),
                    "Content-Type: application/json"
                ),
            )
        );

        $response = curl_exec($curl);
        curl_close($curl);

        $responseArray = json_decode($response, true);

        wp_send_json($responseArray);
    }
}