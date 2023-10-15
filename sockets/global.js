
class Global {
    constructor() {
        this.clientids = [];
        this.sessionsRunning = [];
        this.queue = []; // priority queue works with this
        this.totalplayers = 0;
        this.runningservers = []; // whatever servers are running will be here
    }

    incrementTotalPlayers() {
        this.totalplayers++;
    }

    decrementTotalPlayers() {
        this.totalplayers--;
    }


    addClientToQueue(client) {
        this.queue.push(client);
    }

    removeClientFromQueue(client) {
        const index = this.queue.findIndex(queueItem => queueItem.wsclient === client);

        if (index !== -1) {
            // Found a matching client, remove it from the queue
            this.queue.splice(index, 1);
            console.log('[EON-MMS Queue] Client removed from queue');
        } else {
            console.log('[EON-MMS Queue] Client not found in queue');
        }
    }

    addServerToRunning(server) {
        this.runningservers.push(server);
    }

    removeServerFromRunning(server) {
        throw new Error(1002)
    }

    // if true, client gets in
    doesClientTravel(client) {
        const QueueIndexes = this.queue.slice(0, 100);

        const IsClientIn = QueueIndexes.includes(client);

        if (IsClientIn || this.queue.length < 100) {
            return true;
        } else {
            return false;
        }
    }

    // slices 100 indexes from queue
    removePlayersFromQueue() {
        this.queue.slice(0, 100);
    }
}

module.exports = Global;