import { Container } from "typedi";
import "./Config";
import { AppWorker } from "./workers/AppWorker";

class App {
    private appWorker: AppWorker = Container.get(AppWorker);

    constructor() {
        // check env variables
    }

    public start() {
        this.appWorker.start(Number(process.env.PORT));
    }

    public stop() {
        this.appWorker.stop();
    }
}

function main() {
    const app = new App();
    app.start();

    process.on("SIGINT", () => {
        app.stop();
    });
}

main();