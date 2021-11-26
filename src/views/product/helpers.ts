import { ref, computed, Ref } from "vue";
import store from "@/store";
import { ElLoading, ILoadingInstance } from "element-plus";
import { MenuItem } from "@/components/GooeyMenu.helper";
import { PartCount, Scheme } from "@/lib/scheme";
import { NoDiscountItem, PriceType, Product } from "@/api/interface/provider.interface";

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

export function useStateIcons(scheme: Ref<Scheme | undefined>) {
    const stateCubeIndex = ref(0);
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

    const cubeIndexStates = computed(() => {
        if (!scheme.value) {
            return [];
        }
        return scheme.value.manifest.cubes.map((val, index) => ({
            state: index,
            label: `模式-${index + 1}`,
            iconBg: "black",
            iconColor: "#D8D8D8",
            icon: `number-${index + 1}`,
        }));
    });
    return {
        stateInOut,
        stateOpenClose,
        inOutStates,
        openCloseStates,
        stateCubeIndex,
        cubeIndexStates,
    };
}

export function makePartCompositions(partCounts: PartCount[]) {
    return partCounts
        .filter((p) => p.count > 0)
        .map((p) => {
            const requestPartId = {
                pid: p.partId,
                count: p.count,
            };
            if (p.sizeRatio) {
                const { x, y, z } = p.sizeRatio;
                Object.assign(requestPartId, {
                    width: x,
                    height: y,
                    depth: z,
                });
            }
            return requestPartId;
        });
}
// export function computePartArea(partCount: PartCount, wardrobeSize: Size3D) {
//     let area: number | undefined = undefined;
//     if (!store.state.globalCfg || !partCount.sizeRatio) {
//         return area;
//     }
//     const { partsCatCube, partsCatPartition } = store.state.globalCfg;
//     const { x, y, z } = partCount.sizeRatio;
//     const width = x * wardrobeSize.width,
//         height = y * wardrobeSize.height,
//         depth = z * wardrobeSize.depth;
//     if (partsCatCube.includes(partCount.catId)) {
//         // 柜体面积（深 * 宽 * 2 + 高 * 深 * 2 + 高 * 宽）
//         area = depth * width * 2 + height * depth * 2 + height * width;
//         area *= partCount.count;
//         area = +area.toFixed(2);
//     } else if (partsCatPartition.includes(partCount.catId)) {
//         // 隔板（深 * 宽）
//         area = depth * width;
//         area *= partCount.count;
//         area = +area.toFixed(2);
//     }
//     return area;
// }

export function findDiscount(did: number) {
    return (store.state.globalCfg?.discounts || []).find((item) => item.value === did);
}

export function hasNoDiscount(did: number) {
    return !did || did === NoDiscountItem.value;
}

export function useDiscount(props: Readonly<{ discountId: number }>) {
    const hasDiscount = computed(() => !hasNoDiscount(props.discountId));
    const discount = computed(() => {
        return store.state.globalCfg?.discounts.find((d) => d.value === props.discountId);
    });
    return {
        hasDiscount,
        discount,
    };
}

export function calcNcProductPrice(p: Product, d?: number) {
    let price = (p.price || 0) * (d || 1);
    if (p.otype === PriceType.AREA) {
        price *= p.width * p.depth;
    }
    return price;
}
