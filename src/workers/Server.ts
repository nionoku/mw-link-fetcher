export interface Server {
    start(port: number): void;
    stop(): void;
}
