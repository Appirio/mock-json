# Mock JSON API

This is a mock json library that can be used to replicate an API without having to connect to the API.

Original Cloudpokes Challenge: [http://www.cloudspokes.com/challenges/2333](http://www.cloudspokes.com/challenges/2333)

### Table of Contents

* [Quick Preview](#quick-preview)
* [Library Overview](#library-overview)
* [Source Code Files](#source-code-files)
* [Library Usage Instructions](#library-usage-instructions)
	* [Adding Mock Endpoints to the Library](#adding-mock-endpoints-to-the-library)
		* [Basic Usage](#basic-usage)
		* [Endpoint Order](#endpoint-order)
		* [Fall-Through Mechanism](#fall-through-mechanism)
		* [Handler Shorthand Notation](#handler-shorthand-notation)
		* [Examples](#examples)
* [Unit Tests](#unit-tests)
* [Node Server](#node-server)

## [Quick Preview](id:quick-preview)

Open the `tests/interactive-tests.html` page in a Web browser and try out the library. The simple UI should be pretty self-explanatory: Select an endpoint and click “Generate” to see the mock response status and mock JSON response body. Check and uncheck the “Include an Authorization header” checkbox and click “Generate” to see what happens. Click “Generate” multiple times to see the random nature of the mock JSON response data.


## [Library Overview](id:library-overview)

The library uses the [Sinon.js “fake server” library](http://sinonjs.org/docs/#fakeServer) to intercept AJAX requests and provide mock responses. The library also uses a modified version of the [MockJSON library](https://github.com/mennovanslooten/mockJSON), but only for its template system.


The MockJSON library was modified by disabling AJAX interception, exposing its template system for use outside of the module, and removing its dependency on jQuery. Therefore, none of my `library-files` depend on jQuery at all. However, my `test-files` do depend on jQuery to make the AJAX requests (JSON calls) and handle UI interaction. Meanwhile, my unit tests depend on QUnit, which itself does not depend on jQuery. For more info on file dependencies, please see the accompanying `File-Dependency-Chart.png` image file.


The library makes it easy to add endpoints and gives you enormous flexibility in creating the mock response. To add an endpoint, simply specify the HTTP request method(s) and the URL pattern that the endpoint expects, and implement a handler function to provide a mock response. Inside the handler, you will have full access to all request attributes (i.e., method, URL, parameters, headers, and body) so you can decide how to set the response. In addition, you will be able to set all response attributes (i.e., status code, headers, and body) as you see fit. You can even add MockJSON “randomness” to the response body by using the same exact annotations as those used by [MockJSON](http://experiments.mennovanslooten.nl/2010/mockjson/).


## [Source Code Files](id:source-code-files)

* lib/sinon/
    * sinon-server-1.7.1.js
        * This file is the Sinon.js stand-alone “fake server” library, which was
downloaded from [http://sinonjs.org/docs/#server](http://sinonjs.org/docs/#server).
    * sinon-ie-1.7.1.js
        * This file should be included after the “fake server” library when using the
“fake server” in Internet Explorer. This file was also downloaded from [http://sinonjs.org/docs/#server](http://sinonjs.org/docs/#server).
* lib/mock-json
  * mock-json-template-module.js
    *This file is a modified version of the `jquery.mockjson.js` file that was
downloaded from [https://github.com/mennovanslooten/mockJSON](https://github.com/mennovanslooten/mockJSON). Please see the file for more info on the specific changes that were made to the original file as well as for usage details.
  * mock-json-api-library.js
    * This file defines the `MockJsonApiLib` module that contains the core
mock JSON API library implementation.
* lib/mock-json/plugins
    * Contains all of the plugins for use in the applicaiton

* tests/
    * json-calls-to-box-api.js
        * This file defines the BoxEndpoints module that contains methods for
making JSON calls to the Box.com API endpoints.
    * interactive-tests.html
        * This file (as you’ve hopefully seen) is a test page for interactively testing
the mock JSON API library with several of the Box.com API endpoints.

    * interactive-tests.js
        * This file contains JavaScript code that handles the events on the
“interactive-tests.html” page by making the JSON calls to the selected Box.com API endpoints.

    * unit-test-utilities.js
        * This file defines the Utils module that contains utility functions used
by the unit testing files.

    * unit-tests-for-library.html
        * This file is the QUnit unit-test page that runs the unit tests defined in the
`unit-tests-for-library.js` file and displays the results.

    * unit-tests-for-library.js
        * This file contains the QUnit tests that test the core functionality of the
library implemented in the `MockJsonApiLib` module.

    * unit-tests-for-box-api.html
        * This file is the QUnit unit-test page that runs the unit tests defined in the
“unit-tests-for-box-api.js” file and displays the results.

    * unit-tests-for-box-api.js
        * This file contains the QUnit tests that test the mock Box.com API
endpoints added in the `box.js` file.
* config/
    * Configuration files for the NodeJS server.
    * When adding a new library/plugin to MockJSON be sure to add it item to the "apiFiles" object in `config.dev.js` and `config.production.js`.
* lib/minifier/
    * Minifier library that the NodeJS server uses to concatenate and minify the javascript.
* public/
    * NodeJS public files
* views/
    * Jade Templates for NodeJS server
* routes/
    * Routing file for NodeJS server
* app.js
    * Main application file for NodeJS server
* package.json
    * NPM package file
* Procfile
    * Used by heroku to launch NodeJS server.


## [Library Usage Instructions](id:library-usage-instructions)

If you are not intended to add libraries or plugins to MockJSON the recommend procedure is to add the minified javascript from [http://mock-json.herokuapp.com]().  Follow the on screen instructions.

First, load the library files in the following order:

1. sinon-server-1.7.1.js
2. sinon-ie-1.7.1.js (if the library is used in Internet Explorer)
3. mock-json-template-module.js
4. mock-json-api-library.js
5. any plugins

Then, in your own JavaScript file:

1. **(Optional)** Add custom keywords to the underlying “MockJSON” template system. For more info, please see: [http://experiments.mennovanslooten.nl/2010/mockjson/](http://experiments.mennovanslooten.nl/2010/mockjson/) (scroll down to the “Strings” sub-section). The syntax is similar; the only difference is that here, you use `MockJsonTemplateModule` instead of `$.mockJSON`:


        MockJsonTemplateModule.data.US_STATE = [
            Alabama', 'Alaska', ... , 'Wisconsin', 'Wyoming'
        ];


    The syntax to use the custom keyword in a template is exactly the same:

        { "state" : "@US_STATE" }

    Here’s an example output:


        { "state" : "Alaska" }


    For more info, please see the `mock-json-template-module.js` file. Also, please
    see the `box.js` file for more examples.


2. **(Optional)** Set the underlying “MockJSON” template system to generate “predictable, reproducible JSON”. For more info on “MockJSON” randomness, please see: [http://experiments.mennovanslooten.nl/2010/mockjson/](http://experiments.mennovanslooten.nl/2010/mockjson/) (scroll down to the “Extra’s” sub-section). The syntax is similar; again, the only difference is that here, you use `MockJsonTemplateModule` instead of `$.mockJSON`:


        MockJsonTemplateModule.random = false;


    For more info, please see the `mock-json-template-module.js` file.


3. Call `MockJsonApiLib.addMockEndpoints(newMockEndpoints)` to add mock endpoints to the library. For more info, please see the sub-section titled “[Adding Mock Endpoints to the Library](#adding)” below. Also, please see the `box.js` file for examples.


4. **(Optional)** If needed, call `MockJsonApiLib.removeAllMockEndpoints()` to remove all previously-added mock endpoints from the library. This method is mainly used for testing purposes, but may be called for other reasons.


5. Call `MockJsonApiLib.enable()` to enable AJAX interception. If it is already enabled, then this method does nothing.
￼￼￼￼￼￼
6. Make AJAX requests or JSON calls using `XMLHttpRequest` or jQuery methods like `$.ajax()` or `$.getJSON()`. If an AJAX request matches at least one of the mock endpoints added to the library, then the library will intercept the request and call the endpoint’s request handler to provide a mock response. Otherwise, the library will ignore the AJAX request and allow it to go through to its real destination.

7. **(Optional)** If needed, call `MockJsonApiLib.disable()` to disable AJAX interception. If it is already disabled, then this method does nothing. You can call MockJsonApiLib.enable() to re-enable it afterwards. Meanwhile, the library will maintain all of the endpoints added to it, so you don’t need to add them again.


Actually, you can add and remove endpoints *either before or after* enabling AJAX interception. However, make sure that the endpoints have been added and AJAX interception has been enabled before you make any AJAX requests or JSON calls.


## [Adding Mock Endpoints to the Library](id:adding-mock-endpoints-to-the-library)

### [Basic Usage](id:basic-usage)


Add mock endpoints by calling `MockJsonApiLib.addMockEndpoints()`. This method takes a single argument: an array of mock endpoint objects. A mock endpoint object represents a REST API endpoint, specifying the request method and URL that it expects and the request handler to provide the mock response. Specifically, each mock endpoint object has three __required__ properties:

* **"method"**: a string specifying the HTTP request method that the endpoint expects (e.g., "GET"); you can specify multiple values by separating them with a vertical bar (a.k.a., a pipe) (e.g., "GET|POST|PUT"); you can also use the *exact* string "*" to match any request method.

* **"init"**: a function that is called when the plugin is added to the library.  This can be used to setup any cookies, session variables, etc.

* **"url"**: either (1) a URL string specifying the exact URL that the endpoint expects, (2) a URL template which uses `:param` to match or (2) a RegExp object specifying the URL pattern that the endpoint expects; note: do *not* include the query string in the URL string/pattern when use RegExp.

* **"handler"**: a function to handle incoming requests; the function takes two arguments `(request, response)` and handles the request by modifying the response object.  It can also be an object or a string.


    * **request**: an object that contains the following properties of the AJAX request; use these properties to determine how to set the response.
        * **"method"**: a string specifying the HTTP request method.
        * **"url"**: a string specifying the HTTP request URL, minus the query string if any.
￼￼        * **"params"**: an object containing string-string key-value pairs specifying the parameters from the query string; an empty object (i.e., {}) if there was no query string.  If `:param` was passed in the URL then these values will be included also.
        * **"headers"**: an object containing string-string key-value pairs specifying the HTTP request headers; an empty object (i.e., {}) if there were no request headers.
        * **"body"**: a string specifying the HTTP request body; null if there was no request body.
    * **response**: an object that contains the following properties of the HTTP response. Set these properties to set the mock response that you want to be sent.


        * **"status"**: a number specifying the HTTP response status code; defaults to `200` if not specified.
        * **"headers"**: an object specifying the HTTP response headers as string- string key-value pairs; defaults to empty object (i.e., {}) if not specified.
        * **"body"**: an object specifying the HTTP response body template; this is a “MockJSON” template object that may use “MockJSON” annotations (for more info, see: [http://experiments.mennovanslooten.nl/2010/mockjson/](http://experiments.mennovanslooten.nl/2010/mockjson/)); defaults to null if not specified, in which case an empty string (i.e., "") will be sent as the response body.

* **"asyncInitializer" (Optional)**: a function called if an endpoint needs to make an async callout for data and cannot provide a response until the data arrives. The library will call this initializer function and delay calling the handler function. Make your async callout inside the initializer function, and call request.handleRequest() when the data has arrived, which will cause the library to call the endpoint’s handler function to finish handling the request. So put your data somewhere so that the endpoint’s handler function can access them.
The mere presence of an “asyncInitializer” property on the endpoint object indicates to the library that the endpoint needs to make an async callout and cannot respond immediately. If no async callouts are needed, then just leave out the “asyncInitializer” property and everything should work as before.

    * If an endpoint defines an initializer function, then the endpoint’s handler must be a function, not a string or an object. But if no initializer function is present, then the handler can be a string, a function, or an object as normal.
    * **"request"** The asyncInitializer function should take a parameter called “request”, which will contain all of the properties of the AJAX request the same as defined in the handler function.

### [Endpoint Order](id:endpoint-order)


The `MockJsonApiLib.addMockEndpoints()` method may be called multiple times; the library simply concatenates newly-added endpoints to the end of its private array of endpoint objects. However, please note that the order in which the endpoints are added matters. When it intercepts an AJAX request, the library will search for a matching mock endpoint among those added, *in the order that they were added*. Therefore, if you are using a RegExp object to specify an endpoint’s URL pattern, then try to add more specific endpoints first. For example, in the endpoints array passed to `MockJsonApiLib.addMockEndpoints()`, list the endpoint:


     {
         method: "GET",
         url: /folders\/[0-9]+\/items/,
         handler: function ( request, response ) { ... }
     }


*before* the endpoint:

    {
         method: "GET",
         url: /folders\/[0-9]+/,
         handler: function ( request, response ) { ... }
    }
￼￼￼
￼because an AJAX request to `GET folders/12345678/items` will match *both* endpoints! Listing the more specific endpoint first ensures that it is the one selected to handle this request. Another thing you could do is refine your URL regular expressions, perhaps using the ^ and & special regex characters, which match the beginning of the string and the end of the string, respectively. In any case, keep in mind that the library uses the `test` method from `RegExp` to find a matching endpoint to handle an incoming AJAX request: [https://developer.mozilla.org/en- US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test](https://developer.mozilla.org/en- US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test). For more info on JavaScript regular expressions, please see the MDN JavaScript Guide: [https://developer.mozilla.org/en- US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en- US/docs/Web/JavaScript/Guide/Regular_Expressions).

### [Fall-Through Mechanism](id:fall-through-mechanism)


To handle an AJAX request, the library will call the *first matching* endpoint’s "handler" function. Alternatively, you can enable a sort-of “fall through” behavior in which multiple matching endpoints’ handlers are called in sequence. To do so, simply have a handler return `false` to indicate that the request has *not* been fully handled, which will cause the library to search for another *matching* endpoint and call its handler to continue/finish handling the request. (Have a handler return true or don’t call return at all to indicate that the request has been fully handled, causing the library to stop there.) If another matching endpoint is not found, then the library stops and sends out the response as-is.


Again, remember that the order in which the endpoints are added matters, especially when using “fall through” behavior. When using the “fall through” mechanism, the same `(request, response)` object pair may pass through multiple endpoint handlers and each one may set the response status, headers, and/or body. Afterwards, the library sends out the response based on the *final* properties of the response object.


Note that the library’s “fall through” behavior is *not* the same as the “fall through” behavior of a typical `switch` statement. Specifically, when using the library’s “fall through” mechanism, only *matching* endpoints’ handlers are ever called. Moreover, “fall through” needs to be explicitly enabled by having an endpoint’s handler return `false`. Otherwise, if an endpoint’s handler has no `return` statement, then no “fall through” occurs.


The “fall through” mechanism is useful if you want to specify a “catch-all” endpoint at the beginning to act as a filter for all incoming requests. Please see the `box.js` file for an example of such a “catch-all” endpoint.


### [Handler Shorthand Notation](id:handler-shorthand-notation)


The fact that each endpoint’s `handler` is a function gives you enormous flexibility in creating the response, allowing you to specify complex logic in creating an appropriate response based on the properties of the incoming AJAX request. For example:
￼￼

     {
         method: "GET",
         url: "https://www.example.com",
         ￼handler: function ( request, response ) {
            if ( request.params["foo"] === "bar" ) {
             ￼    } else {
             }
            response.status = 201;
            ￼response.body = { ... };
            ￼￼...
        ￼￼}
    }


However, if an endpoint’s response is the same regardless of the request (i.e., if you don’t care about the request object), then you can use the following shorthand notation: Instead of assigning a function to the endpoint’s "handler" property, you can assign to it an *object* containing `status`, `headers`, and/or `body` properties. For example:


     {
         method: "GET",
         url: "https://www.example.com",
         handler: {
            status: 201,
            ￼body: { ... }
￼        }
    }


is shorthand notation for (*and is exactly equivalent to*) the following:

    {
         method: "GET",
         url: "https://www.example.com",
         ￼handler: function ( request, response ) {
            ￼response.status = 201;
            ￼response.body = { ... };
        ￼}
    }

You can also pass in a string if you already have a formatted JSON:


    {
        method: "get",
        url: "https://wwww.example.com",
        handler: '{"data": "Response"}'
    }

Note that the object shorthand is equivalent to a handler function with *no* `return` statement, which indicates to the library that the request *has* been fully handled. Therefore, when the library encounters an *object* `handler` (instead of a *function* `handler`), the library stops there (without seeking out another matching endpoint) and sends out the response. Keep this in mind when using the “fall through” mechanism discussed above.


### [Examples](id:examples)

The `box.js` file contains loads of examples demonstrating how to add mock endpoints to the library, so be sure to check it out.


### [Unit Tests](id:unit-tests)


To unit test my library, the QUnit testing framework was used. Here are some tutorials to get you started: [http://qunitjs.com/cookbook/](http://qunitjs.com/cookbook/) and [http://benalman.com/talks/unit-testing-qunit.html](http://benalman.com/talks/unit-testing-qunit.html).


The unit-test related files are prefixed with `unit-tests-` and are located in the `test-files` folder. Specifically, open the `unit-tests-for-library.html` and `unit-tests-for-box-api.html` files in a Web browser to run the unit tests and see the results.


It is important to note that, unlike most QUnit tutorials you may encounter, all of the QUnit-related function calls are fully qualified. The purpose is to make my test code more readable and understandable. For example, instead of calling just `test(…)`, `QUnit.test(…)` is called to make clear that the function QUnit `test()` is being called. Likewise, all of the QUnit assertions that I make are fully-qualified as well. For example, instead of calling just `ok(…)`, call `assert.ok(…)` to make clear that the QUnit `ok()` assertion is being called. For more info on fully-qualified QUnit function calls and assertions, please see: [http://api.qunitjs.com/test/](http://api.qunitjs.com/test/) (see the second example on that page).


Since this library involves the interception of AJAX requests, testing this library involves testing asynchronous callbacks. To test async callbacks, for each test, QUnit requires us to:


1. Call `QUnit.stop()` to stop the test runner.
2. Make the AJAX request or JSON call.
3. In the async callback function, call `QUnit.start()` to start the test runner.


If we need to make multiple AJAX requests, then we can pass a number to the `QUnit.stop()` function. For example, if we call `QUnit.stop(5)`, then QUnit will stop and wait until `QUnit.start()` is called 5 times before starting again. In any case, you’ll encounter this kind of thing in the unit tests. For more info, please see: [http://api.qunitjs.com/stop/](http://api.qunitjs.com/stop/), [http://api.qunitjs.com/start/](http://api.qunitjs.com/start/ and [http://benalman.com/talks/unit-testing-qunit.html#38](http://benalman.com/talks/unit-testing-qunit.html#38).

## [Node Sever](id:node-server)

A node.js server is included to minifiy, concatenate and server the javascript needed for the applications.  The server is hosted at [http://mock-json.herokuapp.com]().
