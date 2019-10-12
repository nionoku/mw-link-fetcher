import { Server as HttpServer } from "http";
import Koa from "koa";
import Container, { Service } from "typedi";
import { Logger } from "../utils/Logger";
import { Kontroller } from "../controllers/Kontroller";
import { Server } from "./Server";

@Service()
export class AppWorker implements Server {
    private app = new Koa();
    private server: HttpServer | null = null;
    private controllers: Kontroller[] = [
        // Container.get(extends Kontroller)
    ];

    constructor() {
        this.makeErrorHandlerMiddleware();
        this.makeMiddleware();
    }

    public start(port: number): void {
        this.server = this.app.listen(port, () => Logger.info(AppWorker.name, `${process.env.MODULE_NAME} server running on port '${port}'`));
    }

    public stop(): void {
        if (this.server) {
            this.server.close(() => Logger.info(AppWorker.name, `${process.env.MODULE_NAME} server is stopped`));
        }
    }

    private makeMiddleware() {
        // подключаем контроллеры
        this.controllers.forEach((it) => this.app.use(it.router.middleware()));

        // логгирование результата запроса
        this.app.use(async (ctx) => {
            Logger.info(AppWorker.name, `From: '${ctx.request.ip}' by '${ctx.request.method} ${ctx.request.url}' with status: '${ctx.status}'`);
        });
    }

    private makeErrorHandlerMiddleware() {
        // обработчик Joi ошибок
        this.app.use(async (ctx, next) => next().catch((err) => {
            switch (err.name) {
                case "EntityNotFound":
                case "ValidationError":
                case "QueryFailedError":
                    err.status = 400;
                    break;

                default:
                    err.status = 500;
            }

            ctx.app.emit("error", err, ctx);
        }));

        this.app.on("error", (err, ctx) => {
            this.errorTemplate(ctx, err.status || 500, {
                title: err.name,
                detail: err.detail || err.msg || err.message || "Internal Server Error"
            });

            ctx.app.emit("error-log", err, ctx);
        });

        // общий обработчик ошибок
        this.app.on("error-log", (err, ctx) => {
            // логгирование ошибки
            Logger.error(AppWorker.name, `From: '${ctx.request.ip}' by '${ctx.request.method} ${ctx.request.url}' with status: '${ctx.status}', error: '${err}', detail: '${err.detail ? err.detail : ""}'`);
        });
    }

    private errorTemplate(ctx: Koa.ParameterizedContext<any, {}>, status: number, error: { title: string, detail: string }) {
        ctx.status = status;
        ctx.body = {
            error
        };
    }
}
