// translate mm to inch: 0.001 * 39.3700787
export const SceneUnit = 1; // 0.0393700787;

export function parseManifest(url: string) {
    return require("@/assets/" + url);
}
