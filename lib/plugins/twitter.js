/**
 * Add a custom keyword to the underlying "MockJSON" template system. For more info, please see the
 * "mock-json-template-module.js" file, which contains a modified version of the "MockJSON" library
 * that is used by the mock JSON API library. Also, please see the accompanying "README.pdf" file
 * (jump down to the section titled "Library Usage Instructions").
 */
MockJsonTemplateModule.data.DATE_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
MockJsonTemplateModule.data.DATE_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
MockJsonTemplateModule.data.COLOR = ["DDEEF6", "487F64", "EFEFEF", "DDEEF6", "E6F6F9", "487F64", "DDEEF6", "487F64", "C0DFEC", "87C2A6", "87C2A6", "C0DFEC", "DDEEF6", "252429", "DDEEF6"];
MockJsonTemplateModule.data.RESULT_TYPE = ["recent", "popular"];
MockJsonTemplateModule.data.LANG = ["en", "it", "no", "fr"];
MockJsonTemplateModule.data.LOCATION = ["Napa Valley & San Francisco", "San Francisco", "California", "", "Bay Area, CA", "San Francisco", "Chester", "San Francisco", "California", "Bay Area", "Bay Area", "Salt Lake City, UT", "Oakland, CA", "San Francisco", "OLF"];
MockJsonTemplateModule.data.TIMEZONE = ["Central Time (US & Canada)", "Pacific Time (US & Canada)", "Alaska", "London", "Eastern Time (US & Canada)", "Mountain Time (US & Canada)"];
MockJsonTemplateModule.data.IMAGE_URL = [
        "http://a0.twimg.com/profile_images/2359746665/1v6zfgqo8g0d3mk7ii5s_normal.jpeg",
        "http://a0.twimg.com/profile_images/2359746665/1v6zfgqo8e0d3mk7ii5s_normal.jpeg",
        "http://a0.twimg.com/profile_images/2359746665/1v6zfgqo1e0d3mk7ii5s_normal.jpeg"
];

function setResponseTrue(response) {
  response.headers = {
    "Content-Type": "application/json"
  };
  response.status = 200;
}

/**
 * Add mock twitter.com API endpoints to the library. For more info, see the "mock-json-api-library.js"
 * file, which defines the core mock JSON API library module. Also, please see the accompanying
 * "README.pdf" file (jump down to the sub-section titled "Adding Mock Endpoints to the Library").
 */
MockJsonApiLib.addMockEndpoints([

    // Endpoint 0: Generic endpoint that matches ALL AJAX requests to api.twitter.com search.
    // The purpose of this "catch-all" endpoint is to run code that is common to all endpoints.
    // Specifically, this endpoint's handler ensures that each incoming AJAX request contains an
    // "Authorization" header before allowing it through to a more-specific endpoint's handler.
    // Also, this endpoint's handler sets the response headers that are returned by all endpoints.
    // To achieve this goal, this endpoint's handler uses the library's "fall through" mechanism.
    // For more info, please see the accompanying "README.pdf" file (jump down to the sub-section
    // titled "Fall-Through Mechanism").
    {
        // Match any HTTP request method
        method: "*",

        // URL RegExp literal that matches 
        // "https://api.twitter.com/1.1/search/tweets" followed by anything
        url: /https\:\/\/api\.twitter\.com\/1\.1\/search\/tweets(?:\/.*)?/,

        // This function is called to handle incoming AJAX requests that match this endpoint
        handler: function(request, response) {
            // Set the response headers to be sent out in ANY case
            response.headers = {
                "Content-Type": "application/json"
            };

            // Check for the "Authorization" header in the request
            if ("Authorization" in request.headers) {
                // Return false to tell the library that the request has NOT been fully handled,
                // so the library will search for another matching endpoint (i.e., one of those
                // defined below) to continue/finish handling the request
                return false;
            } else {
                // Set the response status and the response body
                response.status = 401; // 401 = Unauthorized
                response.body = {
                    "errors|1-1": [{
                            message: "Bad Authentication data",
                            code: 215
                        }
                    ]
                };
            };

            // Return true (or don't call return at all) to tell the library that the request
            // HAS been fully handled, so the library will NOT search for another matching
            // endpoint to continue/finish handling the request
            return true;
        }
    },

    {
      method: "*",
      url: /https\:\/\/api\.twitter\.com\/1\.1\/account\/verify_credentials.json/,
      handler: function(request, response) {
        setResponseTrue(response);
      }
    },
    {
      method: "*",
      url: /https\:\/\/api\.twitter\.com\/oauth2\/token/,
      handler: function(request, response) {
        setResponseTrue(response);
      }
    },

    // Endpoint 1: Search tweets
    // https://dev.twitter.com/docs/api/1.1/get/search/tweets
    {
        // Match only "GET" requests
        method: "GET",

        // URL that matches https://api.twitter.com/1.1/search/tweets.json"
        url: "https://api.twitter.com/1.1/search/tweets.json",

        // Possible parameters are :
        //  q
        //  geocode
        //  lang
        //  locale
        //  result_type
        //  count
        //  until
        //  since_id
        //  max_id
        //  include_entities

        // This function is called to handle incoming AJAX requests that match this endpoint
        handler: function(request, response) {
            // Cache the request parameters object
            var params = request.params;
            // Parse the request parameters; if they don't exist, then use default values
            var geocode = params.geocode || "37.781157,-122.398720,1mi"
            var lang = params.lang || "eu"
            var locale = params.locale || "ja"
            var result_type = params.result_type || "mixed"
            var until = params.until || "2012-09-01"

            var count = ("count" in params) ? parseInt(params.count, 10) : 15;
            var since_id = ("since_id" in params) ? parseInt(params.since_id, 10) : 0;
            var max_id = ("max_id" in params) ? parseInt(params.max_id, 10) : 358108884554104832;
            var include_entities = params.include_entities || 1

            // We don't set the response status, so the default value of 200 is used

            // We don't set the response headers here, but they WERE set in the "0th" "catch-all"
            // endpoint's handler to: { "Content-Type": "application/json" }

            // Set the response body to a template object that uses "MockJSON" annotations.
            // This template is based on the example JSON response from:
            // https://dev.twitter.com/docs/api/1.1/get/search/tweets

            var optionals = "";
            ["count", "lang", "geocode", "locale", "result_type", "util"].forEach(function(name) {
                if (name in params) {
                    optionals += "&" + name + "=" + count;
                }
            });

            var next_results = "?max_id=" + max_id + "&q=" + params.q + optionals + "&include_entities=" + include_entities;
            var refresh_url = "?since_id=" + max_id + "&q=" + params.q + optionals + "&include_entities=" + include_entities;

            response.body = {};
            response.body["search_metadata"] = {
                "completed_in": 0.035,
                "max_id": max_id,
                "max_id_str": max_id.toString(),
                "next_results": next_results,
                "query": params.q,
                "refresh_url": refresh_url,
                "count": count,
                "since_id": since_id,
                "since_id_str": since_id.toString(),
            };

            response.body["statuses|1-" + count] = [{
                    "favorited|0-1": true,
                    "truncated|0-1": true,
                    "retweeted|0-1": true,
                    "text": "@LOREM_IPSUM",
                    "retweet_count|0-100": 0,
                    "source": "<a href=\"http://itunes.apple.com/us/app/twitter/id409789998?mt=12\" rel=\"nofollow\">Twitter for Mac</a>",
                    "id_str|18-18": "@NUMBER",
                    "id|300000000000000000-400000000000000000": 0,
                    "in_reply_to_user_id|100000000-200000000": 0,
                    "in_reply_to_user_id_str|9-9": "@NUMBER",
                    "in_reply_to_status_id|300000000000000000-400000000000000000": 0,
                    "in_reply_to_status_id_str|18-18": "@NUMBER",
                    "created_at": "Mon Sep 24 03:35:21 +0000 2012",
                    "created_at": "@DATE_MON @DATE_WEEK @DATE_DD @TIME_HH:@TIME_MM:@TIME_SS +0000 @DATE_YYYY",
                    "coordinates": {
                        "type": "Point",
                        "coordinates|2-2": [37.78527484]
                    },
                    "geo": {
                        "type": "Point",
                        "coordinates|2-2": [37.78527484]
                    },
                    "contributors": null,
                    "place": null,
                    "in_reply_to_screen_name": "@MALE_FIRST_NAME",

                    "metadata": {
                        "iso_language_code": "@LANG",
                        "result_type": "@RESULT_TYPE"
                    },
                    "entities": {
                        "urls": [{
                                "url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                "expanded_url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                "display_url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                "indices|2-2": [20]
                            }
                        ],
                        "hashtags|0-5": [{
                                "text": "@LOREM",
                                "indices|2-2": [20]
                            }
                        ],
                        "user_mentions|0-3": [{
                                "screen_name": "@MALE_FIRST_NAME",
                                "name": "@MALE_FIRST_NAME",
                                "id|100000000-200000000": 0,
                                "id_str|9-9": "@NUMBER",
                                "indices|2-2": [20]
                            }
                        ]
                    },

                    "user": {
                        "profile_sidebar_fill_color": "@COLOR",
                        "profile_sidebar_border_color": "@COLOR",
                        "profile_background_tile|0-1": true,
                        "name": "@MALE_FIRST_NAME @LAST_NAME",
                        "profile_image_url": "@IMAGE_URL",
                        "created_at": "@DATE_MON @DATE_WEEK @DATE_DD @TIME_HH:@TIME_MM:@TIME_SS +0000 @DATE_YYYY",
                        "location": "@LOCATION",
                        "follow_request_sent": null,
                        "profile_link_color": "@COLOR",
                        "is_translator|0-1": true,
                        "id_str|9-9": "@NUMBER",
                        "entities": {
                            "url": {
                                "urls": [{
                                        "url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                        "expanded_url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                        "display_url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                        "indices|2-2": [20]
                                    }
                                ],
                            },
                            "description": {
                                "urls": [{
                                        "url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                        "expanded_url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                        "display_url": "http://t.co/@LETTER_LOWER@LETTER_UPPER@LETTER_LOWER@LETTER_LOWER@LETTER_LOWER",
                                        "indices|2-2": [20]
                                    }
                                ],
                            }
                        },
                        "default_profile|0-1": true,
                        "contributors_enabled|0-1": true,
                        "favourites_count|0-100": 0,
                        "url": null,
                        "profile_image_url_https": "@IMAGE_URL",
                        "utc_offset": -28800,
                        "id|100000000-200000000": 0,
                        "profile_use_background_image|0-1": true,
                        "listed_count|0-100": 0,
                        "profile_text_color": "@COLOR",
                        "lang": "@LANG",
                        "followers_count|0-1000": 0,
                        "protected|0-1": true,
                        "notifications": null,
                        "profile_background_image_url_https": "@IMAGE_URL",
                        "profile_background_color": "@COLOR",
                        "verified|0-1": true,
                        "geo_enabled|0-1": true,
                        "time_zone": "@TIMEZONE",
                        "description": "@LOREM_IPSUM",
                        "default_profile_image|0-1": true,
                        "profile_background_image_url": "@IMAGE_URL",
                        "statuses_count|0-1000": 0,
                        "friends_count|0-1000": 0,
                        "following": null,
                        "show_all_inline_media|0-1": true,
                        "screen_name": "@MALE_FIRST_NAME"
                    },
                }
            ];
        }
    }

]);