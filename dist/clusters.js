"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const os_1 = require("os");
class Clusters {
    constructor() {
        this.cpus = os_1.cpus();
        this.init();
    }
    init() {
        if (cluster.isMaster) {
            // create our workers
            this.cpus.forEach(() => {
                cluster.fork();
            });
            //Listeners
            cluster.on('listening', (worker) => {
                console.log(`Cluster ${worker.process.pid} connected`);
            });
            cluster.on('disconnect', (worker) => {
                console.log(`Cluster ${worker.process.pid} disconnect`);
            });
            cluster.on('exit', (worker) => {
                console.log(`Cluster ${worker.process.pid} exited`);
                // create another process to fill the gap of the leaving process
                cluster.fork();
            });
        }
        else {
            // console.log(' son ', cluster.worker.process.pid  );
            require('./index');
        }
    }
}
exports.default = new Clusters();
