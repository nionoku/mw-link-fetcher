export interface MWFetchModel {
    m3u8: string | null;
    mp4: {
        1080: string | null;
        720: string | null;
        480: string | null;
        360: string | null;
    };
    sub: string | null;
}
