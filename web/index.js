require('dotenv').config();
const express = require('express');
const helpers = require('../helpers');

class Webserver {
    constructor() {
        this.port = process.env.WEB_PORT;
        this.server = express();
    }

    loadEndpoints() {
        this.server.get('/', (req,res) => {
            res.send('can confirm that Eon Matchmaker is working');
        });
    }

    startServer() {
        this.server.listen(this.port, () => {
            console.log(`[EON-WEB]: Webserver listening for connections on ${helpers.getLocalIp()}:${this.port}`);
        });
    }

    // this is just to test if process.env is working as intended
    test() {
        console.log(this.port);
        console.log(this.server);
    }
}

module.exports = Webserver;