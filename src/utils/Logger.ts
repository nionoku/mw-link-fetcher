export class Logger {
    public static info(title: string, message: string) {
        console.info(`[${new Date().toLocaleString()}] [INFO]: [${title}] ${message}`);
    }

    public static error(title: string, error: string | Error) {
        console.error(`[${new Date().toLocaleString()}] [ERROR]: [${title}] ${error}`);
    }

    public static debug(title: string, error: string | Error) {
        console.debug(`[${new Date().toLocaleString()}] [DEBUG]: [${title}] ${error}`);
    }
}
