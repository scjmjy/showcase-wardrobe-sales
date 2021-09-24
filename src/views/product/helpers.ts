import { MenuItem } from "@/components/GooeyMenu.helper";
import { ElMessage, ElLoading, ILoadingInstance } from "element-plus";

let loading: ILoadingInstance | undefined = undefined;
export function showSchemeSaveLoading() {
    if (!loading) {
        loading = ElLoading.service({
            fullscreen: true,
            body: true,
            text: "方案保存中，请稍后......",
            spinner: "el-icon-loading",
        });
    }
}

export function hideSchemeSaveLoading() {
    const loading_ = loading;
    if (loading_) {
        setTimeout(() => {
            loading_.close();
            loading = undefined;
        }, 150);
    }
}

export type CustomizeMode = "new" | "continue" | "copy";
export interface CustomizeSize {
    height: number;
    depth: number;
    width: number;
}
// scheme-new：从某个商品模板来定制新的方案
// scheme-self：自己的方案
// scheme-other：他人的方案
export type SchemeMode = "scheme-new" | "scheme-self" | "scheme-other";

export function resetGooeyMenu(menuItems: MenuItem[]) {
    const ruler = menuItems.find((item) => item.value === "ruler");
    if (ruler && !ruler.active) {
        ruler.active = true;
        ruler.onActive!();
    }
}
