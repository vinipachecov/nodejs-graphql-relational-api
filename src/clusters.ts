import * as cluster from 'cluster';
import { CpuInfo, cpus } from 'os';

class Clusters {

  private cpus: CpuInfo[];

  constructor() {
    this.cpus = cpus();
    this.init();
  }

  init(): void {
    if (cluster.isMaster) {

      // create our workers
      this.cpus.forEach(() => {
        cluster.fork()
      });

      //Listeners

      cluster.on('listening', (worker: cluster.Worker) => {
        console.log(`Cluster ${worker.process.pid} connected`);
      });

      cluster.on('disconnect', (worker: cluster.Worker) => {
        console.log(`Cluster ${worker.process.pid} disconnect`);
      });

      cluster.on('exit', (worker: cluster.Worker) => {
        console.log(`Cluster ${worker.process.pid} exited`);
        // create another process to fill the gap of the leaving process
        cluster.fork();
      });

    } else {
      // console.log(' son ', cluster.worker.process.pid  );
      require('./index');
    }
  }
}

export default new Clusters();