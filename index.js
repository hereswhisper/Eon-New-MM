const Webserver = require('./web/index');
const Websocket = require('./sockets/index');
const Database = require('./models/index');
require('dotenv').config();

let webserver = new Webserver();
let websocket = new Websocket(webserver.server);
let database = new Database();

let debug = process.env.DEBUG;

// make things clean
console.clear();

// if it's true. Test shit cause I'm to lazy to figure it out myself
if (debug == "true") {
    webserver.test();
    websocket.test();
}

// start database service
database.connect();

// load all the endpoints for webserver
webserver.loadEndpoints();

// start listening webserver
webserver.startServer();

// start Websocket
websocket.startServer();

// base logic shit
websocket.baseLogic();