/* eslint @typescript-eslint/no-var-requires: "off" */
import { Scheme } from "@/lib/scheme";
import request from "@/utils/request";
import apiProvider from "@/api/provider";
import { ObjectMapper } from "jackson-js";
import { base64toBlob } from "@/utils/base64";

// export function requestJsonAsync(url: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("GET", url, true);
//         // xhr.overrideMimeType("text/html;charset=utf-8");
//         xhr.send();
//         xhr.onreadystatechange = function () {
//             if (xhr.readyState == 4 && xhr.status == 200) {
//                 resolve(xhr.responseText);
//             }
//         };
//     });
// }

// export function parseManifest(url: string) {
//     // TODO: why cannot require from public folder?
//     // return require("/" + url);
//     return require("@/assets/" + url);
// }

const objectMapper = new ObjectMapper();
export function importSchemeJson(url: string): Promise<Scheme> {
    return new Promise((resolve, reject) => {
        request({
            url: url + `?timestamp=${Date.now()}`, // add timestamp to disable browser cache
            method: "GET",
            responseType: "text",
            transformResponse: (data) => {
                return objectMapper.parse<Scheme>(data, { mainCreator: () => [Scheme] });
            },
        })
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function scheme2manifest(scheme: Scheme) {
    const schemeJson = { config: scheme.config, manifest: scheme.manifest };
    return JSON.stringify(schemeJson, undefined, 4);
}

export async function saveSchemeAsync(schemeId: string | number, scheme: Scheme) {
    const res = await apiProvider.requestSignedUrl(schemeId);
    if (res.ok && res.data) {
        const { accessid, policy, signature, host, dir, filename } = res.data;
        const formData = new FormData();
        formData.append("key", dir + filename);
        formData.append("OSSAccessKeyId", accessid);
        formData.append("policy", policy);
        formData.append("Signature", signature);
        const schemeJSON = scheme2manifest(scheme);
        const file = new Blob([schemeJSON], { type: "application/json" });
        formData.append("file", file, filename);
        const saveRes = await request({
            method: "POST",
            url: host,
            data: formData,
        });
        await apiProvider.updateSchemeState(schemeId);
        scheme.dirty = false;
        return true;
    } else {
        return Promise.reject();
    }
}

export function updateSchemeMetalCount(scheme: Scheme, partId: number, value: number) {
    const parts = scheme.getPartCounts();
    const found = parts.find((p) => p.partId === partId);
    if (found) {
        found.count = value;
        scheme.dirty = true;
        return true;
    }
    return false;
}

export async function uploadSchemeScreenshot(schemeId: string | number, base64: string) {
    const blob = base64toBlob(base64);
    if (!blob) {
        return Promise.reject("Base64 解码失败！");
    }
    const res = await apiProvider.requestScreenshotSignedUrl(schemeId);
    if (res.ok && res.data) {
        const { accessid, policy, signature, host, dir, filename } = res.data;
        const formData = new FormData();
        formData.append("key", dir + filename);
        formData.append("OSSAccessKeyId", accessid);
        formData.append("policy", policy);
        formData.append("Signature", signature);
        formData.append("file", blob, filename);
        const _saveRes = await request({
            method: "POST",
            url: host,
            data: formData,
        });
        await apiProvider.updateScreenshotState(schemeId, dir + filename);
        return true;
    } else {
        return Promise.reject();
    }
}
