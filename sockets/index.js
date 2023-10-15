const Queue = require('./global');
const crypto = require("crypto");
const WebSocket = require("ws").Server;
const helpers = require('../helpers');
require('dotenv').config();

class Websocket {
    constructor(currentweb) {
        this._queue = new Queue();
        this.wss = null; // for now
        this.webserver = currentweb;
    }

    sendMessage(ws, json) {
        ws.send(json);
    }

    isIpBanned(IP) {
        let ip = require('../ban/ip.json');

        if (ip.includes(IP)) {
            return true;
        } else {
            return false;
        }
    }

    isFortniteClient(req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[2] == process.env.UNIQUE_STR) {
            return true;
        } else {
            return false;
        }
    }

    sendRejectionMessage(ws, req) {
        console.log(`[WARNING]: There is possibly a intruder coming from ip: ${req.connection.remoteAddress}`);
    }

    async onMessageLogic(ws, req, message) {
        console.log(`[INCOMING]: Incoming unknown message: ${message}`);
    }

    async onCloseLogic(ws, req) {
        this._queue.removeClientFromQueue(ws); // remove client from local queue
        this._queue.decrementTotalPlayers(); // remove them from total players
    }

    async sendConnecting(ws, req) {
        this.sendMessage(ws, JSON.stringify({ payload: { state: "Connecting", }, name: "StatusUpdate", }))
    }

    async sendWaiting(ws, req) {
        this.sendMessage(ws, JSON.stringify({ payload: { totalPlayers: 0, connectedPlayers: 0, state: "Waiting", }, name: "StatusUpdate", }))
    }

    async sendQueued(ws, req, ticketid) {
        this.sendMessage(ws, JSON.stringify({ payload: { ticketId: ticketid, queuedPlayers: parseInt(0), estimatedWaitSec: 3, status: {}, state: "Queued", }, name: "StatusUpdate", }))
    }

    // this is the logic for Connection
    async onConnectionLogic(ws, req) {
        console.log(`[CONNECTION] Incoming connection from: ${req.connection.remoteAddress}`);
        if (this.isIpBanned(req.connection.remoteAddress)) {
            this.sendRejectionMessage(ws, req);
            return ws.close(1008, "Your IP address has been blacklisted from matchmaking with EON. -> discord.gg/eonfn to appeal.");
        }
        let isClient = this.isFortniteClient(req);
        if (!isClient) {
            this.sendRejectionMessage(ws, req);
            return ws.close(1008, "You are using a unauthorized client to matchmake with EON.");
        }

        // unique identification
        let sessionId = crypto.createHash("md5").update(`3${Date.now()}`).digest("hex"); // this will be their unique sessionid
        let matchId = crypto.createHash("md5").update(`3${Date.now()}`).digest("hex"); // won't be used much (just here cause funny) ;)
        let ticketId = crypto.createHash("md5").update(`3${Date.now()}`).digest("hex"); // won't be used much

        // let client in
        let region = req.headers.authorization.split(" ")[2]; // temp
        let playlist = req.headers.authorization.split(" ")[3]; // temp

        if (!region || !playlist) {
            this.sendMessage(ws, JSON.stringify({ "message": "There is no region or playlist!" }));
            ws.close(1000);
        }

        // probably not best practice but it's most efficient
        this._queue.addClientToQueue({ wsclient: ws, uniqueid: sessionId, region: region, playlist: playlist, hasfoundmatch: false, ispriority: false });

        ws.on("close", async () => {
            this.onCloseLogic(ws, req);
        });

        ws.on("message", (message) => {
            this.onMessageLogic(ws, req, message);
        });


        // player has officially been registered
        this._queue.incrementTotalPlayers();
        console.log(`[SUCCESS] connection has successfully been authenticated: ${req.connection.remoteAddress}`);

        // start the queue process
        await this.sendConnecting(ws, req); // send connection message
        await this.sendWaiting(ws, req); // send waiting

        setTimeout(async () => {
            await this.sendQueued(ws, req, ticketId);
        }, 2000);
    }

    baseLogic() {
        this.wss.on('connection', async (ws, req) => {
            this.onConnectionLogic(ws, req);
        });
    }

    startServer() {
        this._queue.removeServerFromRunning({});
        this.wss = new WebSocket({
            server: this.webserver.listen(process.env.SOCKET_PORT, () =>
                console.log(`[EON-MMS]: Matchmaker Service is listening for connections on ${helpers.getLocalIp()}:${process.env.SOCKET_PORT}`)
            ),
        });
    }

    test() {
        console.log(this._queue);
        console.log(this.wss);
    }
}

module.exports = Websocket;