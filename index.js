const HTTP = require('http')
const YAML = require('yaml')
const URL = require('url').URL
const FS = require('fs')

// The name of the file to parse, contained in the arguments running this program
const FILENAME = process.argv[2]

// Some status constants
const UP_STATUS = 'UP'
const DOWN_STATUS = 'DOWN'

// Max response time before considered 'DOWN' (useful for testing
const MAX_RESPONSE_TIME = 500

// Open the YAML file and parse it. Outputs JSON equivalent of YAML data
const file = FS.readFileSync(FILENAME, 'utf-8')
const yml = YAML.parse(file)


// Results stored in this map
var result_map = new Map()


// Prepares options for our HTTP request from one parsed section of our YAML file
function prepare_options(data) {
    let options = {}
       
    // Get domain and path name of URL from data, add to options
    var url = new URL(data.url)
    options.host = url.host
    if (url.pathname) options.path = url.pathname

    // (Optional) Add headers
    if (data.headers) options.headers = data.headers

    // Get method. If no method, use GET
    options.method = data.method ? data.method : 'GET'

    // (Optional) Get body
    if (data.body) options.body = data.body

    return options
}


// Write a result into our 'database' (a map)
function record_result(domain, result_status) {
    let result
    if (!result_map.has(domain)) {
        // No entry exists, create new result entry object
        result = {'UP' : 0, 'DOWN' : 0 }
    } else {
        // Get existing result entry
        result = result_map.get(domain)
    }

    // Update result entry object
    if (result_status === UP_STATUS) {
        result['UP']++
    } else {
        result['DOWN']++
    }

    // Update data in map
    result_map.set(domain, result)
}

// Prints all results using our 'database'
function print_results() {
    function log_result(value, key) {
        let avail_percent = Math.round((value['UP'] / (value['UP'] + value['DOWN'])) * 100)
        console.log(`${key} has ${avail_percent}% availability percentage`)
    }
    result_map.forEach(log_result)

}

// Uses all URLs parsed in the YAML data, sends http request to each one, logs result
// Returns an array of promise objects
function health_check(endpoints) {
    // List of promises to return
    let promises = []

    for (let data of endpoints) {
        // Extract http request options from data
        let options = prepare_options(data)
        promises.push(new Promise( (resolve, reject) => {

            let start = new Date()
            let request = HTTP.request(options)
        
            request.on('response', (res) => {
                let responseTime = new Date() - start
                let result = res.statusCode >= 200 && res.statusCode < 300 && responseTime < MAX_RESPONSE_TIME ? UP_STATUS : DOWN_STATUS
                record_result(options.host, result)
                resolve()
            })
    
            request.on('error', (err) => {
                // No need to throw error, just log DOWN result and resolve
                record_result(options.host, DOWN_STATUS)
                resolve()
            })
    
            request.end()
        }) )
    }
    return promises
}

// Main Function
async function execute() {
    await Promise.all(health_check(yml))
    print_results()
}

//Run at start and every 15 seconds
execute()
setInterval(execute, 15000)