import KoaRouter from "koa-joi-router";
import { Joi as Validator } from "koa-joi-router";
import { Inject, Service } from "typedi";
import { MWFetchModel } from "../models/MWFetchModel";
import { MWFetchWorker } from "../workers/MWFetchWorker";
import { Kontroller } from "./Kontroller";

@Service()
export class MWFetchController extends Kontroller {
    protected PREFIX: string = "/fetch";

    @Inject()
    private mwFetchWorker!: MWFetchWorker;

    public get router(): KoaRouter.Router {
        const router = this.routerWithPrefix();

        this.fetch(router);

        return router;
    }

    /** POST /fetch */
    public fetch(router: KoaRouter.Router) {
        router.post("/", {
            validate: {
                type: "json",
                body: {
                    link: Validator
                        .string()
                        .uri()
                        .required()
                },
                output: {
                    200: {
                        body: {
                            data: {
                                m3u8: Validator
                                    .string()
                                    .uri()
                                    .allow(null)
                                    .required(),
                                mp4: Validator
                                    .object()
                                    .allow(null)
                                    .required(),
                                sub: Validator
                                    .string()
                                    .uri()
                                    .allow(null)
                                    .required()
                            }
                        }
                    }
                }
            }
        }, async (ctx, next) => {
            const mwVideoIframeLink = new URL(ctx.request.body.link);
            const mwFetchModel: MWFetchModel = await this.mwFetchWorker
                .fetch(mwVideoIframeLink);

            ctx.status = 200;
            ctx.body = {
                data: mwFetchModel
            };

            return next();
        });
    }
}
