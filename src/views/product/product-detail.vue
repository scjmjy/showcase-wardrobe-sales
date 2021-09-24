<template>
    <div
        v-if="product"
        class="product-detail"
        :class="{ 'slide-left-3d': showMenu || (mode === 'view' && !collapseInfoMenu), 'menu-opened': showMenu }"
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
        <el-collapse-transition-h @after-leave="mode = 'edit'">
            <product-info-menu
                v-if="mode === 'view'"
                v-model:collapse="collapseInfoMenu"
                class="product-detail__info"
                :price="product.offer"
                :titles="titles"
                :createScheme="creatingScheme"
                :prepareContinue="prepareContinue"
                :isNew="isNew"
                :isSelf="isSelf"
                :isOther="isOther"
                @newScheme="newScheme"
                @continueScheme="continueEditScheme"
                @copyScheme="copyScheme"
                @offer="onPartsMenuAction('offer')"
            />
        </el-collapse-transition-h>
        <template v-if="mode === 'edit'">
            <el-button class="product-detail__back" icon="el-icon-arrow-left" type="text" @click="gotoBack"
                >返回</el-button
            >
            <div class="product-detail__action-left state-icon-group-h">
                <state-icon
                    v-model="stateInOut"
                    icon="parts-indoor"
                    :states="inOutStates"
                    @change="onInOutChange"
                ></state-icon>
            </div>
            <gooey-menu v-model="gooeyMenuOpened" class="product-detail__gooeyMenu" :items="gooeyMenuItems" />

            <parts-menu
                ref="refPartsMenu"
                v-show="mode === 'edit'"
                v-model:opened="showMenu"
                class="product-detail__menu2d"
                :type="stateInOut"
                @action="onPartsMenuAction"
                @part="onPartSelect"
                @bg="onBgSelect"
            ></parts-menu>
        </template>
        <customize-dlg
            v-model="showCustomizeDlg"
            :mode="customizeMode"
            :size="customizeSize"
            @confirm="onCustomizeConfirm"
            @cancel="onCustomizeCancel"
        />
        <offer-dlg
            v-model="showOfferDlg"
            :schemeId="product.id"
            :schemeName="product.product"
            :customerName="customerName"
            @closed="onOfferDlgClosed"
        />
        <metals-dlg
            v-model="showMetalsDlg"
            :scheme3d="scheme"
            :part="selectedMetalPart"
            @schemeDirty="setSchemeDirty"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, Ref, nextTick, onMounted, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import Babylon from "@/components/Babylon/Babylon.vue";
import { StateType } from "@/store";
import { BackgroundType, Part, PartCategory, Product, Scheme } from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import AppHeader from "@/views/home/components/AppHeader.vue";
import { Area, Door, Position, Size } from "@/lib/scheme";
import * as util from "@/lib/scheme.util";
import GooeyMenu from "@/components/GooeyMenu.vue";
import { MenuItem } from "@/components/GooeyMenu.helper";
import { Event, EventType, ObjectSelectedEvent, ObjectUnselectedEvent } from "@/lib/biz.event";
import { Scheme as Scheme3D, PartType } from "@/lib/scheme";
import type { ImgCardItemType } from "./components/ImgCardItem.vue";
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

        function isProduct(p: any): p is Product {
            // 没有 product id，说明商品
            return p.pid === undefined;
        }

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
            // showCustomizeDlg.value = false;
            mode.value = ""; // after-leave="mode=edit"
            // mode.value = "edit";
            setTimeout(() => {
                switch (customizeMode.value) {
                    case "new":
                    case "copy":
                        showCustomizeDlg.value = true;
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
            },

            {
                state: "out",
                label: "外观",
            },
        ];
        const refBabylon = ref<InstanceType<typeof Babylon>>();
        const refPartsMenu = ref<InstanceType<typeof PartsMenu>>();
        const selectedPart = ref<PartType>();
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
                icon: "ruler",
                onActive() {
                    refBabylon.value?.CreateReferenceRuler(true);
                },
                onUnactive() {
                    refBabylon.value?.CreateReferenceRuler(false);
                },
            },
            {
                value: "size-3d",
                icon: "size-3d",
                type: "button",
                onClick() {
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
                    // TODO reload scheme
                    refBabylon.value?.reloadScheme();
                    ElMessage.warning("TODO：重新加载之前的方案");
                } else {
                    scheme.value = s;
                    nextTick(() => {
                        resetGooeyMenu(gooeyMenuItems.value);
                    });
                }
            });
        }
        requestScheme3D();

        onMounted(() => {});
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
            const cid = store.state.currentCustomer.customerId.toString();
            const eid = store.state.user.eid;
            if (svcId === 0) {
                const service = (await apiProvider.createNewService(eid, cid)).data!;
                svcId = service.id;
            }
            if (customizeMode.value === "new") {
                creatingScheme.value = true;
                const p = product.value as Product;
                apiProvider
                    .createNewScheme(p.name, svcId, eid, cid, p.id)
                    .then((res) => {
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
                    })
                    .finally(() => {
                        creatingScheme.value = false;
                    });
            } else if (customizeMode.value === "copy") {
                creatingScheme.value = true;
                const scheme = product.value as Scheme;
                apiProvider
                    .createNewScheme(scheme.product, svcId, eid, cid, undefined, scheme.id)
                    .then((res) => {
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
                    })
                    .finally(() => {
                        creatingScheme.value = false;
                    });
            }
        }

        function onDeleteClick(part_type: string) {
            // debugger;
            if (!refBabylon.value) {
                console.error("refBabylon.value is not defined!");
                throw Error("refBabylon.value is not defined!");
            }

            switch (part_type) {
                case "door":
                    refBabylon.value.removeDoorsApi();
                    break;
                default:
                    throw Error(`unknown part type: ${part_type}`);
            }
        }
        function onAddDoorClick(type: string, partId?: number, mfUrl?: string) {
            if (!refBabylon.value) {
                console.error("refBabylon.value is not defined!");
                throw Error("refBabylon.value is not defined!");
            }

            // 测试: addDoorApi()
            let door_part_id = partId || -1;
            let door_mf_url = "";
            let door_cubes: string[] = [];
            switch (type) {
                case "left":
                    {
                        const catId = 3;
                        // 合页门 (type: 1): add 2 doors for both cubes
                        door_mf_url = mfUrl || "43b3e66e-c416-4602-bb76-97a172138737.json";
                        door_cubes = ["4cd170f8-291b-4236-b515-b5d27ac1209d"];
                        const size = new Size(750, 2360, 40);
                        refBabylon.value.addDoorApi(
                            new Door("", door_part_id, door_mf_url, catId, size, 1, door_cubes),
                        );

                        door_cubes = ["ce28f905-a6e1-4f68-9998-ed13f950ea91"];
                        refBabylon.value.addDoorApi(
                            new Door("", door_part_id, door_mf_url, catId, size, 1, door_cubes),
                        );
                    }
                    break;

                case "slide":
                    {
                        // 滑门 (type: 2). 需要指定2个连续的cube
                        door_mf_url = mfUrl || "bbf7f299-7ae8-4977-a26e-5e09b761a8fe.json";
                        door_cubes = ["4cd170f8-291b-4236-b515-b5d27ac1209d", "ce28f905-a6e1-4f68-9998-ed13f950ea91"];
                        const catId = 2;
                        const size = new Size(1500, 2360, 40);
                        refBabylon.value.addDoorApi(
                            new Door("", door_part_id, door_mf_url, catId, size, 2, door_cubes),
                        );
                    }
                    break;

                case "right":
                    throw Error("TODO: a door is fixed at RIGHT");

                default:
                    throw Error(`Error: unkonwn door type: ${type}`);
            }
        }
        function onUpdateWallClick(wall?: ImgCardItemType) {
            if (wall) {
                const key = wall.value.toString();
                refBabylon.value?.bizdata.partManifestMap.set(key, wall.url);
                selectedWallId.value = +key;
            } else if (selectedWallId.value === 0) selectedWallId.value = 100001;
            else if (selectedWallId.value === 100001) selectedWallId.value = 100002;
            else if (selectedWallId.value === 100002) selectedWallId.value = 100003;
            else if (selectedWallId.value === 100003) selectedWallId.value = 100004;
            else if (selectedWallId.value === 100004) selectedWallId.value = 100001;
            else selectedWallId.value = 100001;
            refBabylon.value?.changeWallApi(selectedWallId.value);
        }
        function onUpdateFloorClick(floor?: ImgCardItemType) {
            if (floor) {
                const key = floor.value.toString();
                refBabylon.value?.bizdata.partManifestMap.set(key, floor.url);
                selectedFloorId.value = +key;
            } else if (selectedFloorId.value === 0) selectedFloorId.value = 110001;
            else if (selectedFloorId.value === 110001) selectedFloorId.value = 110002;
            else if (selectedFloorId.value === 110002) selectedFloorId.value = 110003;
            else if (selectedFloorId.value === 110003) selectedFloorId.value = 110004;
            else if (selectedFloorId.value === 110004) selectedFloorId.value = 110001;
            else selectedFloorId.value = 110001;
            refBabylon.value?.changeFloorApi(selectedFloorId.value);
        }
        const baseUrl = computed(() => store.state.globalCfg?.baseUrl);

        const { customerName } = store.state.currentCustomer;

        async function saveScheme() {
            await util.saveSchemeAsync(product.value.id, scheme.value!);
            if (scheme.value !== undefined) scheme.value.dirty = false;
            schemeDetailDirty.value = true;
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
                    if (scheme.value?.dirty) {
                        await saveScheme();
                    }
                    await refPartsMenu.value?.showManifest(scheme2d.id, false);
                    break;
                case "offer":
                    if (scheme.value?.dirty) {
                        await saveScheme();
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
            onDeleteClick,
            onAddDoorClick,
            onUpdateWallClick,
            onUpdateFloorClick,
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
            titles: computed(() => {
                let productName = "";
                const p = product.value;
                if (isProduct(p)) {
                    productName = p.name;
                    const de = customerName ? "的" : "-";
                    return {
                        title: customerName || "商品详情",
                        subTitle: `${de}${productName}`,
                    };
                } else {
                    productName = p.product;
                    return {
                        title: p.customer,
                        subTitle: `的${productName}`,
                    };
                }
            }),
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
                prepareContinue.value = true;
                await requestSchemeDetail();
                prepareContinue.value = false;
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
            onCustomizeConfirm(_size: CustomizeSize) {
                showCustomizeDlg.value = false;
                // TODO
                ElMessage.warning("TODO：修改柜体尺寸");
            },
            onCustomizeCancel() {
                showCustomizeDlg.value = false;
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
                resetGooeyMenu(gooeyMenuItems.value);
                mode.value = "view";
            },
            onInOutChange(_val: string) {
                showMenu.value = true;
            },
            onPartSelect(part: Part, cat: PartCategory) {
                if (!part.manifest) {
                    selectedMetalPart.value = part;
                    showMetalsDlg.value = true;
                    return;
                }
                const marnifestUrl = part.manifest.replace(baseUrl.value || "", "");
                selectedPart.value = {
                    id: +part.id,
                    width: part.width,
                    height: part.height,
                    depth: part.depth,
                    manifest: marnifestUrl,
                    catId: +cat.id,
                };
            },
        };
    },
});
</script>

<style scoped lang="scss">
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
        right: -345px;
        white-space: nowrap;
        transition: right 0.3s ease;
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
        padding: 0 20px;
        white-space: nowrap;
        text-align: center;
        background-color: white;
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
        left: -170px;
    }
    &.menu-opened &__menu2d {
        right: 0px;
    }
}

@media (max-width: 1200px) {
    .product-detail {
        &__menu2d {
            right: -270px;
        }
    }
}
@media (max-width: 1100px) {
    .product-detail {
        &__menu2d {
            right: -190px;
        }
    }
}
</style>
