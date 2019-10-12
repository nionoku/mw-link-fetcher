import Axios from "axios";
import FormData from "form-data";
import { Service } from "typedi";
import { URL } from "url";
import { NullPointerException } from "../exceptions/NullPointerException";
import { MP4LinksModel } from "../models/MP4LinksModel";
import { MWFetchModel } from "../models/MWFetchModel";
import { StreamsLinksModel } from "../models/StreamsLinksModel";
import { VideoBalancerOptions } from "../models/VideoBalancerOptions";
import { Logger } from "../utils/Logger";

@Service()
export class MWFetchWorker {
    public async grab(iframeLink: URL): Promise<MWFetchModel> {
        const videoPage = await this.getVideoPage(iframeLink);
        const videoBalancerOptions = this.getVideoBalancerOptions(videoPage);
        const directLinkGeneratorScript = await this.getLinkDirectLinkGeneratorScript(videoPage);
        const queryToken = this.generateQueryToken(directLinkGeneratorScript, videoBalancerOptions);
        const streamLinks = await this.getStreamLinks(iframeLink.origin, queryToken, videoBalancerOptions.ref);
        const mp4LinksModel = await this.getVideoLinks(new URL(streamLinks.mp4!));

        return {
            m3u8: streamLinks.m3u8,
            mp4: mp4LinksModel,
            sub: streamLinks.subtitles
        };
    }

    private getVideoPage(iframeLink: URL): Promise<string> {
        return Axios.request({
            method: "GET",
            url: iframeLink.toString(),
            headers: {
                "user-agent": process.env.HEADER_USER_AGENT,
                "referer": process.env.HEADER_REFERERER
            }
        }).then((res) => {
            Logger.info(MWFetchWorker.name, `Getting video page: status: ${res.status}, message: ${res.statusText}`);

            return res.data;
        });
    }

    private getVideoBalancerOptions(videoPage: string): VideoBalancerOptions {
        try {
            const videoBalancerOptionsString = videoPage.match(/(var [\w_]+ = ({(\n.+){1,}});)/m);
            if (!videoBalancerOptionsString || !videoBalancerOptionsString[2]) {
                throw new NullPointerException("VideoBalancerOptions");
            }

            Logger.info(MWFetchWorker.name, `Getting video balancer options: success`);

            // tslint:disable-next-line: no-eval
            return eval(`(${videoBalancerOptionsString[2]})`);
        } catch (err) {
            throw err;
        }
    }

    private getLinkDirectLinkGeneratorScript(videoPage: string): Promise<string> {
        try {
            const link4DirectLinkGeneratorScript = videoPage.match(/<script src="(.+video-.+\.js)"><\/script>/);
            if (!link4DirectLinkGeneratorScript || !link4DirectLinkGeneratorScript[1]) {
                throw new NullPointerException("DirectLinkGeneratorScriptLink");
            }

            return Axios.request({
                method: "GET",
                url: link4DirectLinkGeneratorScript[1].toString(),
                headers: {
                    "user-agent": process.env.HEADER_USER_AGENT,
                    "referer": process.env.HEADER_REFERERER
                }
            }).then((res) => {
                Logger.info(MWFetchWorker.name, `Getting direct link script: status: ${res.status}, message: ${res.statusText}`);

                return res.data;
            });
        } catch (err) {
            throw err;
        }
    }

    private generateQueryToken(directLinkGeneratorScript: string, videoBalancerOptions: VideoBalancerOptions): string {
        const scriptMatch = directLinkGeneratorScript.match(/((var \w={([a-z]:[\w.]+,?){6}}.+),\w=\w\.ajax\({url:"\/vs")/);

        if (!scriptMatch || !scriptMatch[1]) {
            throw new NullPointerException("scriptMatch");
        }

        const queryTokenGeneratorScript = scriptMatch[2].toString()
            .replace(/a:(.*?),/, `a:${videoBalancerOptions.partner_id},`)
            .replace(/b:(.*?),/, `b:${videoBalancerOptions.domain_id},`)
            .replace(/c:(.*?),/, `c:false,`)
            .replace(/d:(.*?),/, `d:"${videoBalancerOptions.player_skin}",`)
            .replace(/e:(.*?),/, `e:"${videoBalancerOptions.video_token}",`)
            .replace(/f:(.*?)}/, `f:"${process.env.HEADER_USER_AGENT}"}`);

        // tslint:disable-next-line: no-eval
        const queryToken = eval(`
            const e = {};
            const CryptoJS = require("../utils/CryptoJS.js");
            ${queryTokenGeneratorScript};
            (u ? u.toString() : null)
        `);

        if (queryToken) {
            Logger.info(MWFetchWorker.name, `Getting query token: success`);

            return queryToken;
        } else {
            throw new NullPointerException("queryToken");
        }
    }

    private getStreamLinks(host: string, queryToken: string, ref: string): Promise<StreamsLinksModel> {
        const s = new FormData();
        s.append("q", queryToken);
        s.append("ref", ref);

        return Axios.request({
            method: "POST",
            url: `${host}/vs`,
            headers: {
                "user-agent": process.env.HEADER_USER_AGENT,
                ...s.getHeaders()
            },
            data: s
        }).then((res) => {
            Logger.info(MWFetchWorker.name, `Getting stream links: status: ${res.status}, message: ${res.statusText}`);

            return res.data;
        });
    }

    private getVideoLinks(videoStreamLinks: URL): Promise<MP4LinksModel> {
        return Axios.get(videoStreamLinks.toString()).then((res) => {
            Logger.info(MWFetchWorker.name, `Getting MP4 links: status: ${res.status}, message: ${res.statusText}`);

            return res.data;
        });
    }
}
