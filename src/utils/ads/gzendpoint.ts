
export const GZ_API_HOST = "api.fig.brainburst.cloud";

export const GZ_RANK_SERVICE_ID = "742590";

export const GZ_FLASHUP_SERIVCE_ID = "74bf23";

export const GZ_IAP_SERVICE_ID = "2b6d11";

export function gzServiceUrl(serviceId: string) {
    return `https://${GZ_API_HOST}/${serviceId}`;
}

export function gzRankUrl() {
    return gzServiceUrl(GZ_RANK_SERVICE_ID);
}

export function gzFlashupUrl() {
    return gzServiceUrl(GZ_FLASHUP_SERIVCE_ID) + "/v1/event";
}

export function gzIapUrl() {
    return `https://${GZ_API_HOST}/${GZ_IAP_SERVICE_ID}/v1`;
}
