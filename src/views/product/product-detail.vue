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
            :size="customizeSize"
            :selectedPart="selectedPart"
            :eventEmit="eventHandle"
            :mode="mode3D"
            :schemeType="scheme3DType"
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
            :nonCustom="!product.customized"
            @newScheme="newScheme"
            @continueScheme="continueEditScheme"
            @copyScheme="copyScheme"
            @offer="onPartsMenuAction('offer')"
            @order="orderNonCustomProduct"
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
                :completeDisabled="completeDisabled"
                :schemeId="product.id"
                @action="onPartsMenuAction"
                @part="onPartSelect"
                @attachment-replacement="onAttachmentChange"
                @bg="onBgChange"
            ></parts-menu>
        </template>
        <template v-if="mode === 'view'">
            <div class="product-detail__action-left state-icon-group-h">
                <state-icon v-model="stateOpenClose" :states="openCloseStates" @change="onOpenCloseChange"></state-icon>
            </div>
        </template>
        <customize-dlg
            v-model="showCustomizeDlg"
            :mode="customizeMode"
            :size="customizeSize"
            :minMax="customizeMinMax"
            :unit-price="testUnitPrice"
            @confirm="onCustomizeConfirm"
            @cancel="onCustomizeCancel"
        />
        <offer-dlg
            ref="refOfferDlg"
            v-model="showOfferDlg"
            :schemeId="product.id"
            :schemeName="product.product"
            :customerName="customerName"
            :scheme="scheme"
            :size="customizeSize"
            @closed="onOfferDlgClosed"
        />
        <metals-dlg v-model="showMetalsDlg" :scheme3d="scheme" :part="selectedMetalPart" @change-part="onChangePart" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, nextTick, onMounted, provide, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Babylon from "@/components/Babylon/Babylon.vue";
import { StateType } from "@/store";
import {
    Part,
    PartAttachment,
    PartCategory,
    Product,
    Scheme,
    isProduct,
    ManifestPart,
    BackgroundType,
} from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import AppHeader from "@/views/home/components/AppHeader.vue";
import * as util from "@/lib/scheme.util";
import GooeyMenu from "@/components/GooeyMenu.vue";
import { MenuItem } from "@/components/GooeyMenu.helper";
import { Event, EventType, ObjectSelectedEvent, ObjectUnselectedEvent } from "@/lib/biz.event";
import { Scheme as Scheme3D, Part as Part3D, PartType } from "@/lib/scheme";
import CustomizeDlg from "./components/CustomizeDlg.vue";
import OfferDlg from "./components/OfferDlg.vue";
import MetalsDlg from "./components/MetalsDlg.vue";
import PartsMenu, { ActionType } from "./components/PartsMenu.vue";
import ProductInfoMenu from "./components/ProductInfoMenu.vue";
import {
    showSchemeSaveLoading,
    hideSchemeSaveLoading,
    CustomizeMode,
    CustomizeMinMax,
    SchemeMode,
    resetGooeyMenu,
    useStateIcons,
    InOutState,
    OpenCloseState,
} from "./helpers";
import { Size3D } from "@/api/interface/common.interface";
import { ImgCardItemType } from "./components/ImgCardItem.vue";

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

        const ready = ref(false);
        const mode = ref<"view" | "edit" | "">("view");
        let svcId = +(route.query.svc || 0);

        const productDetailData = store.state.pageChannel.productDetailData;
        // store.commit("SET-PAGE-CHANNEL", { key: "productDetailData", value: undefined });

        const product = ref(productDetailData as Product | Scheme);

        const customizeSize = computed<Size3D>(() => {
            const { width, height, depth } = product.value;
            return {
                width: width,
                height: height,
                depth: depth,
            };
        });

        const scheme3DType = computed(() => {
            // 0 - 定制商品
            // 1 - 非定制商品
            return product.value.customized === 1 ? 0 : 1;
        });
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
        const testUnitPrice = ref(0);

        async function gotoEditScheme() {
            mode.value = "edit";
            setTimeout(() => {
                switch (customizeMode.value) {
                    case "new":
                    case "copy":
                        showCustomizeDlg.value = true;
                        showReferenceRuler(false);
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
        const { stateInOut, stateOpenClose, inOutStates, openCloseStates } = useStateIcons();

        const refBabylon = ref<InstanceType<typeof Babylon>>();
        const refPartsMenu = ref<InstanceType<typeof PartsMenu>>();
        const selectedPart = ref<Part3D>();
        const selectedMetalPart = ref<Part>();

        function showReferenceRuler(show: boolean) {
            refBabylon.value?.showReferenceRuler(show);
        }

        const gooeyMenuItems = computed<MenuItem[]>(() => {
            const items: MenuItem[] = [
                {
                    value: "d3",
                    icon: "d3",
                    noClose: true,
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
                    noClose: true,
                    onActive() {
                        showReferenceRuler(true);
                    },
                    onUnactive() {
                        showReferenceRuler(false);
                    },
                },
                {
                    value: "size-3d",
                    icon: "size-3d",
                    type: "button",
                    noClose: true,
                    onClick() {
                        showReferenceRuler(false);
                        showCustomizeDlg.value = true;
                    },
                },
            ];
            if (stateInOut.value === InOutState.out) {
                items.push({
                    value: "parts-outdoor",
                    icon: "parts-outdoor",
                    noClose: true,
                    onActive() {
                        if (scheme3DType.value === 0) {
                            refBabylon.value?.showDoors(false);
                        }
                    },
                    onUnactive() {
                        if (scheme3DType.value === 0) {
                            refBabylon.value?.showDoors(true);
                        }
                    },
                });
            }
            return items;
        });
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

        onMounted(async () => {
            if (schemeMode.value !== "scheme-new") {
                await requestSchemeDetail();
            } else {
                await requestProductDetail();
            }
            ready.value = true;
            showReferenceRuler(true);
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
        async function createNewScheme(nonCustom = false, size?: Size3D) {
            const { customerId, currentSvcId } = store.state.currentCustomer;
            const cid = customerId.toString();
            const eid = store.state.user.eid;
            let schemeName = "";
            let svcid: number | undefined = 0;
            let pid: number | string | undefined = undefined;
            let sid: number | string | undefined = undefined;
            if (customizeMode.value === "new" || customizeMode.value === "new-non-custom") {
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

                if (size) {
                    const newSchemeId = res.data.id;
                    await apiProvider.changeSchemeSize(newSchemeId, size);
                }

                return apiProvider.requestSchemeDetail(res.data.id).then(async (res) => {
                    if (res.ok && res.data) {
                        product.value = res.data;
                        product.value.cid = cid;

                        await captureSchemeScreenshot();
                        if (nonCustom) {
                            if (refOfferDlg.value) {
                                refOfferDlg.value.doOffer();
                            }
                        } else {
                            gotoEditScheme();
                        }
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
            captureSchemeScreenshot();
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

        async function requestProductDetail() {
            const id = product.value.id;
            const res = await apiProvider.requestProductDetail(id);
            if (res.ok && res.data) {
                res.data.id = id;
                Object.assign(product.value, res.data);
            }
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
                    await refPartsMenu.value?.showManifest(scheme.value!.getPartCounts(), customizeSize.value);
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
            ready,
            gooeyMenuItems,
            gooeyMenuOpened,
            refBabylon,
            refPartsMenu,
            refOfferDlg,
            scheme,
            setSchemeDirty,
            schemeDetailDirty,
            customizeMode,
            customizeSize,
            customizeMinMax: computed<CustomizeMinMax | undefined>(() => {
                const p = product.value;
                if (isProduct(p)) {
                    return {
                        depthMax: p.depthmax,
                        depthMin: p.depthmin,
                        // depthMin: p.depth,
                        widthMax: p.widthmax,
                        widthMin: p.widthmin,
                        // widthMin: p.width,
                        heightMax: p.heightmax,
                        heightMin: p.heightmin,
                        // heightMin: p.height,
                    };
                }
                return {
                    depthMax: p.pdepthmax,
                    depthMin: p.pdepthmin,
                    // depthMin: p.depth,
                    widthMax: p.pwidthmax,
                    widthMin: p.pwidthmin,
                    // widthMin: p.width,
                    heightMax: p.pheightmax,
                    heightMin: p.pheightmin,
                    // heightMin: p.height,
                };
            }),
            selectedPart,
            selectedMetalPart,
            baseUrl,
            mode3D: computed(() => {
                if (mode.value === "view") {
                    return 3;
                } else {
                    return stateInOut.value === "in" ? 2 : 1;
                }
            }),
            scheme3DType,
            eventHandle,
            stateInOut,
            inOutStates,
            stateOpenClose,
            openCloseStates,
            showMenu,
            collapseInfoMenu,
            completeDisabled: computed(() => !scheme.value || !scheme.value.dirty),
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
            testUnitPrice,
            orderNonCustomProduct() {
                // TODO backend should give us this vlue
                customizeMode.value = "new-non-custom";
                testUnitPrice.value = 800;
                showCustomizeDlg.value = true;
            },
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
            async onCustomizeConfirm(size: Size3D) {
                if (customizeMode.value === "new-non-custom") {
                    await createNewScheme(true, size);
                    showCustomizeDlg.value = false;
                    router.push("/");
                    return;
                }
                showCustomizeDlg.value = false;
                const scheme = product.value as Scheme;
                scheme.width = size.width;
                scheme.height = size.height;
                scheme.depth = size.depth;
                schemeDetailDirty.value = true;
                refBabylon.value?.changeSchemeSize(size.width, size.height, size.depth);
                setTimeout(() => {
                    showReferenceRuler(true);
                }, 200);
                await apiProvider.changeSchemeSize(scheme.id, size);
            },
            onCustomizeCancel() {
                showCustomizeDlg.value = false;
                showReferenceRuler(true);
            },
            onChangePart() {
                showMetalsDlg.value = false;
                setSchemeDirty();
            },
            onPartsMenuAction,
            onAttachmentChange(newAttachment: ManifestPart, oldAttachment: ManifestPart) {
                refBabylon.value?.changeAttachments(oldAttachment.partid, newAttachment.partid, newAttachment.catid);
            },
            onBgChange(bg: ImgCardItemType, bgType: BackgroundType) {
                if (bgType === BackgroundType.WALL) {
                    refBabylon.value?.changeWallApi(bg);
                } else {
                    refBabylon.value?.changeFloorApi(bg);
                }
            },
            async gotoBack() {
                if (scheme.value?.dirty) {
                    try {
                        await ElMessageBox.confirm("确认保存方案吗？", "温馨提示", {
                            confirmButtonText: "保存方案",
                            cancelButtonText: "不保存",
                            type: "warning",
                            distinguishCancelAndClose: true,
                        });
                        showSchemeSaveLoading();
                        await saveScheme();
                        hideSchemeSaveLoading();
                    } catch (action) {
                        if (action === "cancel") {
                            // 点击了 “不保存” 按钮
                            requestScheme3D();
                        } else {
                            // 点击 x 按钮
                            return;
                        }
                    }
                }
                if (schemeDetailDirty.value) {
                    requestSchemeDetail();
                }

                // reset states
                stateInOut.value = InOutState.out;
                stateOpenClose.value = OpenCloseState.close;
                showMenu.value = false;
                resetGooeyMenu(gooeyMenuItems.value);
                mode.value = "view";
            },
            onInOutChange(_state: InOutState) {
                showMenu.value = true;
                gooeyMenuOpened.value = false;
            },
            onOpenCloseChange(state: OpenCloseState) {
                if (scheme3DType.value === 0) {
                    refBabylon.value?.showDoors(state !== OpenCloseState.open);
                } else if (scheme3DType.value === 1) {
                    refBabylon.value?.switchCube(state === OpenCloseState.open ? 1 : 0);
                }
            },
            onOfferDlgClosed() {
                requestSchemeDetail();
            },
            onPartSelect(part: Part, cat: PartCategory) {
                if (!part.manifest) {
                    // selectedMetalPart.value = part;
                    // selectedMetalPart.value.catId = +cat.id;
                    // showMetalsDlg.value = true;
                    return;
                }
                const marnifestUrl = part.manifest.replace(baseUrl.value || "", "");
                let attachments: PartAttachment[] = [];
                const attachmentItem = store.state.attachments.find((item) => item.partCmId == part.id);
                if (attachmentItem) {
                    attachments.push(...attachmentItem.attachmentsList);
                }

                let partType = PartType.UNKNOWN;
                switch (cat.id) {
                    case 2:
                        partType = PartType.SLIDE_DOOR;
                        break;
                    case 3:
                        partType = PartType.HINGE_DOOR;
                        break;
                    case 20:
                        partType = PartType.CUBE;
                        break;
                    case 24:
                        partType = PartType.SPOT_LIGHT;
                        break;
                    case 25:
                        partType = PartType.STRIP_LIGHT;
                        break;
                    default:
                        partType = PartType.GENERAL;
                        break;
                }

                if (part.id === 101) partType = PartType.VERTICAL_SCALE;
                if (part.id === 64) partType = PartType.HORIZONTAL_SCALE;
                if (part.id === 72) partType = PartType.HORIZONTAL_SCALE;
                if (part.id === 102) partType = PartType.HORIZONTAL_SCALE;

                selectedPart.value = {
                    id: +part.id,
                    name: part.name,
                    width: part.width,
                    height: part.height,
                    depth: part.depth,
                    manifest: marnifestUrl,
                    catId: +cat.id,
                    partType: partType,
                    attachments,
                };
            },
        };
    },
});
</script>

<style scoped lang="scss">
$menu-width: 25%;
.product-detail {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    &__3d {
        flex: 1;
        height: 100%;
        overflow: hidden;
        position: relative;
        left: 0px;
        transition: left 0.3s ease-in-out;
    }
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
        transition: right 0.3s ease;
        position: absolute;
        top: 70px;
        bottom: 0px;
        right: 0px;
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
    &.slide-left-3d &__3d {
        left: calc(-#{$menu-width} / 2);
    }
    &.menu-opened &__menu2d {
        right: 0px;
    }
}

.collapse {
    right: calc(-#{$menu-width} + 80px);
}
</style>
