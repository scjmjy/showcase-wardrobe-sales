<template>
    <div
        v-if="product"
        class="product-detail"
        :class="{ 'slide-left-3d': showMenu || (mode === 'view' && !collapseInfoMenu) }"
    >
        <transition name="el-zoom-in-top">
            <app-header v-if="mode === 'view'" type="dark" :stop="false" icon="" />
        </transition>
        <Babylon
            v-if="scheme"
            ref="refBabylon"
            class="product-detail__3d"
            :scheme="scheme"
            :selectedPart="selectedPart"
            :selectedWallId="selectedWallId"
            :selectedFloorId="selectedFloorId"
            :eventEmit="eventHandle"
            :mode="mode3D"
            :baseOSSUrl="baseUrl"
        />
        <product-info-menu
            v-if="mode === 'view'"
            v-model:collapse="collapseInfoMenu"
            class="product-detail__info"
            :class="{ collapse: collapseInfoMenu }"
            :product="product"
            :creatingScheme="creatingScheme"
            :prepareContinue="prepareContinue"
            :isNew="isNew"
            :isSelf="isSelf"
            :isOther="isOther"
            @newScheme="newScheme"
            @continueScheme="continueEditScheme"
            @copyScheme="copyScheme"
            @offer="onPartsMenuAction('offer')"
        />
        <template v-if="mode === 'edit'">
            <el-button class="product-detail__back" icon="el-icon-arrow-left" type="text" @click="gotoBack"
                >返回</el-button
            >
            <div class="product-detail__action-left state-icon-group-h">
                <state-icon v-model="stateInOut" :states="inOutStates" @change="onInOutChange"></state-icon>
            </div>
            <gooey-menu v-model="gooeyMenuOpened" class="product-detail__gooeyMenu" :items="gooeyMenuItems" />

            <parts-menu
                ref="refPartsMenu"
                v-show="mode === 'edit'"
                v-model:opened="showMenu"
                class="product-detail__menu2d"
                :class="{ collapse: !showMenu }"
                :type="stateInOut"
                @action="onPartsMenuAction"
                @part="onPartSelect"
            ></parts-menu>
        </template>
        <customize-dlg
            v-model="showCustomizeDlg"
            :mode="customizeMode"
            :size="customizeSize"
            :minMax="customizeMinMax"
            @confirm="onCustomizeConfirm"
            @cancel="onCustomizeCancel"
        />
        <offer-dlg
            ref="refOfferDlg"
            v-model="showOfferDlg"
            :schemeId="product.id"
            :schemeName="product.product"
            :customerName="customerName"
            @closed="onOfferDlgClosed"
        />
        <metals-dlg v-model="showMetalsDlg" :scheme3d="scheme" :part="selectedMetalPart" @change-part="onChangePart" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, Ref, nextTick, onMounted, provide, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Babylon from "@/components/Babylon/Babylon.vue";
import { StateType } from "@/store";
import { Part, PartAttachment, PartCategory, Product, Scheme, isProduct } from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import AppHeader from "@/views/home/components/AppHeader.vue";
import * as util from "@/lib/scheme.util";
import GooeyMenu from "@/components/GooeyMenu.vue";
import { MenuItem } from "@/components/GooeyMenu.helper";
import { Event, EventType, ObjectSelectedEvent, ObjectUnselectedEvent } from "@/lib/biz.event";
import { Scheme as Scheme3D, Part as Part3D } from "@/lib/scheme";
import CustomizeDlg from "./components/CustomizeDlg.vue";
import OfferDlg from "./components/OfferDlg.vue";
import MetalsDlg from "./components/MetalsDlg.vue";
import PartsMenu, { ActionType } from "./components/PartsMenu.vue";
import ProductInfoMenu from "./components/ProductInfoMenu.vue";
import {
    showSchemeSaveLoading,
    hideSchemeSaveLoading,
    CustomizeMode,
    CustomizeSize,
    CustomizeMinMax,
    SchemeMode,
    resetGooeyMenu,
} from "./helpers";

export default defineComponent({
    name: "ProductDetail",
    components: {
        AppHeader,
        CustomizeDlg,
        OfferDlg,
        MetalsDlg,
        Babylon,
        PartsMenu,
        GooeyMenu,
        ProductInfoMenu,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const store = useStore<StateType>();

        const mode = ref<"view" | "edit" | "">("view");
        let svcId = +(route.query.svc || 0);

        const productDetailData = store.state.pageChannel.productDetailData;
        // store.commit("SET-PAGE-CHANNEL", { key: "productDetailData", value: undefined });

        const product = ref(productDetailData as Product | Scheme);

        const schemeMode = computed<SchemeMode>(() => {
            const p = product.value;
            if (isProduct(p)) {
                return "scheme-new";
            }
            return p.cid.toString() === store.state.currentCustomer.customerId.toString() + ""
                ? "scheme-self"
                : "scheme-other";
        });
        const customizeMode = ref<CustomizeMode>("new");
        const showCustomizeDlg = ref(false);
        const showOfferDlg = ref(false);
        const showMetalsDlg = ref(false);
        const creatingScheme = ref(false);
        const prepareContinue = ref(false);

        async function gotoEditScheme() {
            mode.value = "edit";
            setTimeout(() => {
                switch (customizeMode.value) {
                    case "new":
                    case "copy":
                        showCustomizeDlg.value = true;
                        refBabylon.value?.showReferenceRuler(false);
                        break;
                    case "continue":
                        break;
                    default:
                        break;
                }
            }, 200);
        }
        const showMenu = ref(false);
        const collapseInfoMenu = ref(true);

        const stateInOut = ref<"in" | "out">("out");
        const inOutStates = [
            {
                state: "in",
                label: "内配",
                iconBg: "black",
                iconColor: "#D8D8D8",
                icon: "parts-indoor-2",
            },

            {
                state: "out",
                label: "外观",
                icon: "parts-outdoor-2",
            },
        ];
        const refBabylon = ref<InstanceType<typeof Babylon>>();
        const refPartsMenu = ref<InstanceType<typeof PartsMenu>>();
        const selectedPart = ref<Part3D>();
        const selectedMetalPart = ref<Part>();
        let selectedPartId = ref(0);
        let selectedFloorId = ref(0);
        let selectedWallId = ref(0);

        const gooeyMenuItems = ref<MenuItem[]>([
            {
                value: "d3",
                icon: "d3",
                onActive() {
                    refBabylon.value?.setCameraAlpha(Math.PI / 3);
                },
                onUnactive() {
                    refBabylon.value?.setDefaultCamera();
                },
            },
            {
                value: "ruler",
                icon: "ruler-2",
                onActive() {
                    refBabylon.value?.showReferenceRuler(true);
                },
                onUnactive() {
                    refBabylon.value?.showReferenceRuler(false);
                },
            },
            {
                value: "size-3d",
                icon: "size-3d",
                type: "button",
                onClick() {
                    refBabylon.value?.showReferenceRuler(false);
                    showCustomizeDlg.value = true;
                },
            },
        ]);
        const gooeyMenuOpened = ref(false);
        const scheme = ref<Scheme3D>();
        const schemeDetailDirty = ref(false);
        async function requestScheme3D() {
            await util.importSchemeJson(product.value.manifest).then((s) => {
                if (scheme.value) {
                    scheme.value = s;

                    nextTick(() => {
                        refBabylon.value?.reloadScheme();
                    });
                } else {
                    scheme.value = s;
                    nextTick(() => {
                        resetGooeyMenu(gooeyMenuItems.value);
                    });
                }
            });
        }
        requestScheme3D();

        onMounted(() => {
            if (schemeMode.value !== "scheme-new") {
                requestSchemeDetail();
            }
        });
        function eventHandle(event: Event) {
            switch (event.type) {
                case EventType.OBJECT_SELECTED:
                    {
                        const objectSelectedEvent = event as ObjectSelectedEvent;
                        if (objectSelectedEvent !== undefined) {
                            // console.log(objectSelectedEvent);
                            showMenu.value = true;
                            refPartsMenu.value?.selectPart(objectSelectedEvent.catId, objectSelectedEvent.partId);
                        }
                    }
                    break;
                case EventType.OBJECT_UNSELECTED:
                    {
                        const objectUnselectedEvent = event as ObjectUnselectedEvent;
                        if (objectUnselectedEvent !== undefined) {
                            // console.log(objectUnselectedEvent);
                            refPartsMenu.value?.unselectPart(objectUnselectedEvent.catId, objectUnselectedEvent.partId);
                        }
                    }
                    break;
            }
        }
        async function createNewScheme() {
            const { customerId, currentSvcId } = store.state.currentCustomer;
            const cid = customerId.toString();
            const eid = store.state.user.eid;
            let schemeName = "";
            let svcid: number | undefined = 0;
            let pid: number | string | undefined = undefined;
            let sid: number | string | undefined = undefined;
            if (customizeMode.value === "new") {
                pid = product.value.id;
                schemeName = product.value.name;
                svcid = svcId;
            } else if (customizeMode.value === "copy") {
                const scheme = product.value as Scheme;
                svcid = schemeMode.value === "scheme-other" ? currentSvcId : svcId;
                schemeName = scheme.product;
                sid = scheme.id;
            }
            if (!svcid) {
                const service = (await apiProvider.createNewService(eid, cid)).data!;
                svcid = svcId = service.id;
                store.commit("SET-CUSTOMER-CURRENT-SVCID", svcid);
            }
            creatingScheme.value = true;

            const res = await apiProvider.createNewScheme(schemeName, svcid, eid, cid, pid, sid);
            if (res.ok && res.data) {
                store.commit("SET-DIRTY-SCHEME", { cid: cid, dirty: true });

                apiProvider.requestSchemeDetail(res.data.id).then((res) => {
                    if (res.ok && res.data) {
                        product.value = res.data;
                        product.value.cid = cid;
                        gotoEditScheme();
                    }
                });
            } else if (res.show) {
                ElMessage({
                    type: res.show,
                    message: res.msg,
                });
            }
            creatingScheme.value = false;
        }

        const baseUrl = computed(() => store.state.globalCfg?.baseUrl);

        const { customerName } = store.state.currentCustomer;

        const refOfferDlg = ref<InstanceType<typeof OfferDlg>>();

        async function saveScheme() {
            await util.saveSchemeAsync(product.value.id, scheme.value!);
            const scheme2d = product.value as Scheme;
            if (scheme2d.offer && refOfferDlg.value) {
                await refOfferDlg.value.doOffer();
            }
            if (scheme.value !== undefined) scheme.value.dirty = false;
            schemeDetailDirty.value = true;
        }

        async function captureSchemeScreenshot() {
            const base64 = await refBabylon.value!.screenshotApi();
            await util.uploadSchemeScreenshot(product.value.id, base64);
        }

        async function requestSchemeDetail() {
            const res = await apiProvider.requestSchemeDetail(product.value.id);
            Object.assign(product.value, res.data);
            schemeDetailDirty.value = false;
        }

        async function onPartsMenuAction(action: ActionType) {
            const scheme2d = product.value as Scheme;
            switch (action) {
                case "manifest":
                    await refPartsMenu.value?.showManifest(scheme.value!.composition);
                    break;
                case "offer":
                    if (scheme.value?.dirty) {
                        // try {
                        //     await ElMessageBox.confirm("报价前请先保存方案！", "温馨提示", {
                        //         confirmButtonText: "保存方案",
                        //         cancelButtonText: "不保存",
                        //         type: "warning",
                        //     });
                        showSchemeSaveLoading();
                        await saveScheme();
                        hideSchemeSaveLoading();
                        // } catch (_) {
                        //     ElMessage.warning("取消报价");
                        //     break;
                        // }
                    }
                    showOfferDlg.value = true;
                    store.commit("SET-DIRTY-SCHEME", { cid: scheme2d.cid, dirty: true });
                    break;
                case "save":
                    {
                        showSchemeSaveLoading();
                        await saveScheme();
                        hideSchemeSaveLoading();
                    }
                    break;
                case "complete":
                    try {
                        await ElMessageBox.confirm(
                            h("div", undefined, [
                                h("p", undefined, "您确定保存方案，"),
                                h("p", undefined, "并回到“客户服务页面”吗？"),
                            ]),
                            "温馨提示",
                            {
                                confirmButtonText: "确认",
                                cancelButtonText: "取消",
                                type: "warning",
                            },
                        );
                        // if (scheme.value?.dirty) {
                        showSchemeSaveLoading();
                        await saveScheme();
                        await captureSchemeScreenshot();
                        hideSchemeSaveLoading();
                        // }
                        router.push({
                            path: "/",
                        });
                    } catch (_err) {
                        //
                    }
                    break;

                default:
                    break;
            }
        }
        provide("updateSchemeMetalCount", ({ partId = 0, value = 0 }) => {
            if (scheme.value) {
                util.updateSchemeMetalCount(scheme.value, partId, value);
            }
        });
        function setSchemeDirty(dirty = true) {
            if (scheme.value) {
                scheme.value.dirty = dirty;
            }
        }
        return {
            gooeyMenuItems,
            gooeyMenuOpened,
            refBabylon,
            refPartsMenu,
            refOfferDlg,
            scheme,
            setSchemeDirty,
            schemeDetailDirty,
            customizeMode,
            customizeSize: computed<CustomizeSize | undefined>(() => {
                const p = product.value;
                if (isProduct(p)) {
                    return undefined;
                }
                return {
                    width: p.width,
                    height: p.height,
                    depth: p.depth,
                };
            }),
            customizeMinMax: computed<CustomizeMinMax | undefined>(() => {
                const p = product.value;
                if (isProduct(p)) {
                    return undefined;
                }
                return {
                    depthMax: p.pdepthmax,
                    // depthMin: p.pdepthmin,
                    depthMin: p.depth,
                    widthMax: p.pwidthmax,
                    // widthMin: p.pwidthmin,
                    widthMin: p.width,
                    heightMax: p.pheightmax,
                    // heightMin: p.pheightmin,
                    heightMin: p.height,
                };
            }),
            selectedPart,
            selectedMetalPart,
            selectedPartId,
            selectedWallId,
            selectedFloorId,
            baseUrl,
            mode3D: computed(() => {
                if (mode.value === "view") {
                    return 3;
                } else {
                    return stateInOut.value === "in" ? 2 : 1;
                }
            }),
            eventHandle,
            stateInOut,
            inOutStates,
            showMenu,
            collapseInfoMenu,
            mode,
            schemeMode,
            product,
            isNew: computed(() => schemeMode.value === "scheme-new"),
            isSelf: computed(() => schemeMode.value === "scheme-self"),
            isOther: computed(() => schemeMode.value === "scheme-other"),
            showCustomizeDlg,
            showOfferDlg,
            showMetalsDlg,
            creatingScheme,
            prepareContinue,
            customerName,
            newScheme() {
                if (!store.state.currentCustomer.customerId) {
                    ElMessage({
                        type: "warning",
                        message: "没有正在服务的客户",
                    });
                    return;
                }
                customizeMode.value = "new";
                createNewScheme();
                // showCustomizeDlg.value = true;
            },
            async continueEditScheme() {
                customizeMode.value = "continue";
                gotoEditScheme();
            },
            copyScheme() {
                if (!store.state.currentCustomer.customerId) {
                    ElMessage({
                        type: "warning",
                        message: "没有正在服务的客户",
                    });
                    return;
                }
                customizeMode.value = "copy";
                createNewScheme();
                // showCustomizeDlg.value = true;
            },
            onCustomizeConfirm(size: CustomizeSize) {
                showCustomizeDlg.value = false;
                const scheme = product.value as Scheme;
                scheme.width = size.width;
                scheme.height = size.height;
                scheme.depth = size.depth;
                refBabylon.value?.changeSchemeSize(size.width, size.height, size.depth);
                refBabylon.value?.showReferenceRuler(true);
            },
            onCustomizeCancel() {
                showCustomizeDlg.value = false;
                refBabylon.value?.showReferenceRuler(true);
            },
            onChangePart() {
                showMetalsDlg.value = false;
                setSchemeDirty();
            },
            onPartsMenuAction,
            async gotoBack() {
                if (scheme.value?.dirty) {
                    try {
                        await ElMessageBox.confirm("确认保存方案吗？", "温馨提示", {
                            confirmButtonText: "保存方案",
                            cancelButtonText: "不保存",
                            type: "warning",
                        });
                        showSchemeSaveLoading();
                        await saveScheme();
                        hideSchemeSaveLoading();
                    } catch (_) {
                        requestScheme3D();
                    }
                }
                if (schemeDetailDirty.value) {
                    requestSchemeDetail();
                }

                // reset states
                stateInOut.value = "out";
                showMenu.value = false;
                resetGooeyMenu(gooeyMenuItems.value);
                mode.value = "view";

                captureSchemeScreenshot();
            },
            onInOutChange(_val: string) {
                showMenu.value = true;
            },
            onOfferDlgClosed() {
                requestSchemeDetail();
            },
            onPartSelect(part: Part, cat: PartCategory) {
                if (!part.manifest) {
                    selectedMetalPart.value = part;
                    showMetalsDlg.value = true;
                    return;
                }
                const marnifestUrl = part.manifest.replace(baseUrl.value || "", "");
                let attachments: PartAttachment[] = [];
                const attachmentItem = store.state.attachments.find((item) => item.partCmId == part.id);
                if (attachmentItem) {
                    attachments.push(...attachmentItem.attachmentsList);
                }

                selectedPart.value = {
                    id: +part.id,
                    width: part.width,
                    height: part.height,
                    depth: part.depth,
                    manifest: marnifestUrl,
                    catId: +cat.id,
                    attachments,
                };
            },
        };
    },
});
</script>

<style scoped lang="scss">
$menu-width: 25%;
// $menu-min-width: 250px;
.product-detail {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    // background-color: var(--el-color-bg);
    // background: linear-gradient(#f2f4f5, #f1f3f4);
    overflow: hidden;
    &__3d {
        // flex: 1;
        // overflow: auto;
        // width: 800px;
        // height: 600px;
        // width: 100%;
        flex: 1;
        height: 100%;
        overflow: hidden;
        position: relative;
        left: 0px;
        transition: left 0.3s ease-in-out;
    }

    // &__action-customize {
    //     position: absolute;
    //     top: 0px;
    //     right: 0px;
    //     bottom: 0px;
    //     width: 280px;
    //     white-space: nowrap;
    //     display: flex;
    //     flex-direction: column;
    //     justify-content: center;
    //     align-items: center;
    //     background-color: white;
    // }
    &__back {
        position: absolute;
        left: 30px;
        top: 10px;
        font-size: 26px;
        color: black !important;
    }
    &__menu2d {
        position: absolute;
        top: 0px;
        bottom: 0px;
        right: 0;
        white-space: nowrap;
        transition: right 0.3s ease;
        width: $menu-width;
    }
    &__info {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        top: 0px;
        bottom: 0px;
        right: 0px;
        padding: 0 1.5%;
        white-space: nowrap;
        background-color: white;

        width: $menu-width;
    }
    &__action-left {
        position: absolute;
        left: 60px;
        bottom: 30px;
    }
    &__gooeyMenu {
        position: absolute;
        left: 140px;
        bottom: 68px;
    }
    &__action-test {
        position: absolute;
        left: 120px;
        top: 10px;
    }
    &__action-right {
        position: absolute;
        right: 60px;
        bottom: 20px;
    }
    &__action-top {
        position: absolute;
        top: 90px;
        right: 60px;
        transition: right 0.3s ease-in-out;
    }
    // &.slide-left-3d &__action-top {
    //     right: 348px;
    // }
    &.slide-left-3d &__3d {
        // left: -170px;
        left: calc(-#{$menu-width} / 2);
    }
    &.menu-opened &__menu2d {
        right: 0px;
    }
}

.collapse {
    right: calc(-#{$menu-width} + 80px);
}

// .test {
//     &-screenshot {
//         width: 800px;
//         height: 600px;
//         position: absolute;
//         left: 0;
//         top: 80px;
//     }
// }
// @media (min-width: 1150px) {
//     .product-detail {
//         &__menu2d {
//             right: -270px;
//         }
//     }
// }
// @media (min-width: 1366px) {
//     .product-detail {
//         &__menu2d {
//             right: -345px;
//         }
//     }
// }
</style>
