import { MenuItem } from "@/components/GooeyMenu.helper";
import { ElMessage, ElLoading, ILoadingInstance } from "element-plus";
import { ref } from "vue";

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

export function hideSchemeSaveLoading(delay = 150) {
    const loading_ = loading;
    if (loading_) {
        setTimeout(() => {
            loading_.close();
            loading = undefined;
        }, delay);
    }
}

export type CustomizeMode = "new" | "continue" | "copy" | "new-non-custom";
export interface CustomizeMinMax {
    depthMax: number;
    depthMin: number;
    widthMax: number;
    widthMin: number;
    heightMax: number;
    heightMin: number;
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

export enum InOutState {
    in = "in",
    out = "out",
}
export enum OpenCloseState {
    open = "open",
    close = "close",
}

export function useStateIcons() {
    const stateInOut = ref<InOutState>(InOutState.out);
    const stateOpenClose = ref<OpenCloseState>(OpenCloseState.close);
    const inOutStates = [
        {
            state: InOutState.in,
            label: "内配",
            iconBg: "black",
            iconColor: "#D8D8D8",
            icon: "parts-indoor-2",
        },
        {
            state: InOutState.out,
            label: "外观",
            icon: "parts-outdoor-2",
        },
    ];
    const openCloseStates = [
        {
            state: OpenCloseState.open,
            label: "开门",
            iconBg: "black",
            iconColor: "white",
            // icon: "door-open",
            icon: "parts-outdoor",
        },
        {
            state: OpenCloseState.close,
            label: "关门",
            iconBg: "black",
            iconColor: "white",
            icon: "door-close",
        },
    ];
    return {
        stateInOut,
        stateOpenClose,
        inOutStates,
        openCloseStates,
    };
}
