import KoaRouter, { Router } from "koa-joi-router";

export abstract class Kontroller {
    protected abstract readonly PREFIX: string;

    public abstract get router(): Router;

    protected routerWithPrefix(): Router {
        const router = KoaRouter();
        router.prefix(this.PREFIX);
        return router;
    }
}
