<template>
    <div v-if="product" class="product-detail" :class="{ 'slide-left-3d': showMenu, 'menu-opened': showMenu }">
        <transition name="el-zoom-in-top">
            <app-header
                v-if="mode === 'view'"
                type="dark"
                :stop="false"
                icon=""
                :title="titles.title"
                :subTitle="titles.subTitle"
            />
        </transition>
        <Babylon
            ref="refBabylon"
            class="product-detail__3d"
            :scheme="scheme"
            :selectedPart="selectedPart"
            :selectedPartId="selectedPartId"
            :selectedWallId="selectedWallId"
            :selectedFloorId="selectedFloorId"
            :getAvailableArea2="getAvailableArea"
            :eventEmit="eventHandle"
            :mode="mode3D"
        />
        <!-- <img class="product-detail__3d" src="@/assets/img/demo/demo-wardrobe.png" /> -->
        <div v-if="mode === 'view'" class="product-detail__info">
            <div class="product-detail__info-name">{{ product.name }}</div>
            <div v-if="!isNew" class="product-detail__info-offer">{{ product.offer || "待报价" }}</div>
            <div class="product-detail__info-action">
                <el-button type="primary" round v-if="isNew" @click="newScheme" :loading="loadingCreating"
                    >开始定制</el-button
                >
                <el-button type="primary" round v-if="isSelf" @click="continueEditScheme">继续定制</el-button>
                <el-button type="primary" round v-if="isSelf && !product.offer" @click="offer">报价</el-button>
                <el-button type="primary" round v-if="isSelf || isOther" @click="copyScheme" :loading="loadingCopying"
                    >由此方案定制</el-button
                >
            </div>
        </div>
        <template v-if="mode === 'edit'">
            <el-button class="product-detail__back" icon="el-icon-arrow-left" type="text" @click="gotoBack"
                >返回</el-button
            >
            <!-- TODO: remove the test codes -->
            <div class="product-detail__action-test state-icon-group-h">
                <state-icon icon="offer" label="查看Scheme" @change="onLogSchemeClick"></state-icon>
                <state-icon icon="offer" label="合页门" @change="onAddDoorClick('left')"></state-icon>
                <state-icon icon="offer" label="滑门" @change="onAddDoorClick('slide')"></state-icon>
                <state-icon icon="offer" label="清除门" @change="onDeleteClick('door')"></state-icon>
                <state-icon icon="offer" label="替换墙面" @change="onUpdateWallClick()"></state-icon>
                <state-icon icon="offer" label="替换地板" @change="onUpdateFloorClick()"></state-icon>
            </div>
            <div class="product-detail__action-left state-icon-group-h">
                <!-- <state-icon
                    v-model="stateSelect"
                    icon="select-all"
                    label="全选"
                    @change="onSelectAllClick"
                ></state-icon>
                <state-icon icon="metals" label="五金" @change="onMetalsClick"></state-icon> -->
                <state-icon
                    v-model="stateInOut"
                    icon="parts-indoor"
                    :states="inOutStates"
                    @change="onInOutChange"
                ></state-icon>
                <!-- <state-icon v-model="state3D" icon="empty" @change="on3DClick"></state-icon> -->
                <!-- <state-icon v-model="state3D" icon="d3" @change="on3DClick"></state-icon>
                <state-icon v-model="stateRuler" icon="ruler" @change="onRulerClick"></state-icon> -->
                <!-- <state-icon
                    icon="parts"
                    label="部件"
                    iconColor="white"
                    iconBg="#5EB6B3"
                    @change="onPartsClick"
                ></state-icon> -->
            </div>
            <gooey-menu v-model="gooeyMenuOpened" class="product-detail__gooeyMenu" :items="gooeyMenuItems" />

            <!-- <div class="product-detail__action-top state-icon-group-v">
                <state-icon v-model="state3D" icon="d3" @change="on3DClick"></state-icon>
                <state-icon v-model="stateRuler" icon="ruler" @change="onRulerClick"></state-icon>
            </div> -->
            <!-- <el-collapse-transition-h>
            </el-collapse-transition-h> -->
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
            :title="customizeDlgTitle"
            @confirm="onCustomizeConfirm"
            @cancel="onCustomizeCancel"
        />
        <offer-dlg v-model="showOfferDlg" title="报价" @confirm="showOfferDlg = false" @cancel="showOfferDlg = false" />
        <metals-dlg v-model="showMetalsDlg" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, Ref, nextTick } from "vue";
import Babylon, { PartType } from "@/components/Babylon/Babylon.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { StateType } from "@/store";
import { BackgroundType, Part, PartCategory, Product, Scheme } from "@/api/interface/provider.interface";
import type { ImgCardItemType } from "./components/ImgCardItem.vue";
import apiProvider from "@/api/provider";
import AppHeader from "@/views/home/components/AppHeader.vue";
import CustomizeDlg from "./components/CustomizeDlg.vue";
import OfferDlg from "./components/OfferDlg.vue";
import MetalsDlg from "./components/MetalsDlg.vue";
import PartsMenu, { ActionType } from "./components/PartsMenu.vue";
import { ElMessage } from "element-plus";
import { Area, Door, Position } from "@/lib/scheme";
import * as util from "@/lib/scheme.util";
import GooeyMenu, { MenuItem } from "@/components/GooeyMenu.vue";
import { Event, EventType, ObjectSelectedEvent, ObjectUnselectedEvent } from "@/lib/biz.event";

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
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const store = useStore<StateType>();

        const mode = ref<"view" | "edit" | "">("view");

        const productDetailData = store.state.pageChannel.productDetailData;
        // store.commit("SET-PAGE-CHANNEL", { key: "productDetailData", value: undefined });

        const product = ref(productDetailData as Product | Scheme);

        function isProduct(p: any): p is Product {
            // 没有 product id，说明商品
            return p.pid === undefined;
        }

        const schemeMode = computed<"scheme-new" | "scheme-self" | "scheme-other">(() => {
            const p = product.value;
            if (isProduct(p)) {
                return "scheme-new";
            }
            return p.cid.toString() === store.state.currentCustomer.customerId.toString() + ""
                ? "scheme-self"
                : "scheme-other";
        });
        const customizeMode = ref<"new" | "continue" | "copy">("new");
        const showCustomizeDlg = ref(false);
        const showOfferDlg = ref(false);
        const showMetalsDlg = ref(false);
        const loadingCreating = ref(false);
        const loadingCopying = ref(false);

        async function gotoEditScheme() {
            showCustomizeDlg.value = false;
            mode.value = "edit";
        }

        const customizeDlgTitle = computed(() => {
            switch (customizeMode.value) {
                case "copy":
                    return "复制方案";
                case "new":
                default:
                    return "新方案定制";
            }
        });
        const showMenu = ref(false);

        const state3D = ref<"active" | "">("");
        const stateRuler = ref<"active" | "">("");
        const stateSelect = ref<"active" | "">("");
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
        let selectedPartId = ref(0);
        let selectedFloorId = ref(0);
        let selectedWallId = ref(0);
        const scheme = ref(util.importSchemeJson("mf/scheme.json"));
        function getAvailableArea(part: PartType): Area[] {
            part;

            // TODO: compute the available areas later.
            const areas = [];
            let area = new Area(
                "4cd170f8-291b-4236-b515-b5d27ac1209d",
                new Position(-350, 1050, -270),
                new Position(350, 1900, 290),
            );
            areas.push(area);

            area = new Area(
                "ce28f905-a6e1-4f68-9998-ed13f950ea91",
                new Position(-350, 350, -270),
                new Position(350, 1900, 290),
            );
            areas.push(area);

            return areas;
        }
        const gooeyMenuItems = ref<MenuItem[]>([
            {
                value: "d3",
                icon: "d3",
                onActive() {
                    ElMessage({
                        type: "warning",
                        message: "TODO: 3D固定视图 on",
                    });
                },
                onUnactive() {
                    ElMessage({
                        type: "warning",
                        message: "TODO: 3D固定视图 off",
                    });
                },
            },
            {
                value: "ruler",
                icon: "ruler",
                onActive() {
                    ElMessage({
                        type: "warning",
                        message: "TODO: 3D视图显示标尺 on",
                    });
                },
                onUnactive() {
                    ElMessage({
                        type: "warning",
                        message: "TODO: 3D视图显示标尺 off",
                    });
                },
            },
        ]);
        const gooeyMenuOpened = ref(false);
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
        function onCustomizeConfirm() {
            const cid = store.state.currentCustomer.customerId.toString();
            if (customizeMode.value === "new") {
                loadingCreating.value = true;
                const p = product.value as Product;
                apiProvider
                    .createNewScheme(p.name, store.state.user.eid, cid, p.id)
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
                        loadingCreating.value = false;
                    });
            } else if (customizeMode.value === "copy") {
                loadingCopying.value = true;
                const scheme = product.value as Scheme;
                apiProvider
                    .createNewScheme(scheme.product, store.state.user.eid, cid, undefined, scheme.id)
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
                        loadingCopying.value = false;
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
        function onAddDoorClick(type: string, partId?: number) {
            // debugger;
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
                        door_mf_url = "43b3e66e-c416-4602-bb76-97a172138737.json";
                        door_cubes = ["4cd170f8-291b-4236-b515-b5d27ac1209d"];
                        refBabylon.value.addDoorApi(new Door("", door_part_id, door_mf_url, catId, 1, door_cubes));

                        door_cubes = ["ce28f905-a6e1-4f68-9998-ed13f950ea91"];
                        refBabylon.value.addDoorApi(new Door("", door_part_id, door_mf_url, catId, 1, door_cubes));
                    }
                    break;

                case "slide":
                    {
                        // 滑门 (type: 2). 需要指定2个连续的cube
                        door_mf_url = "bbf7f299-7ae8-4977-a26e-5e09b761a8fe.json";
                        door_cubes = ["4cd170f8-291b-4236-b515-b5d27ac1209d", "ce28f905-a6e1-4f68-9998-ed13f950ea91"];
                        const catId = 2;
                        refBabylon.value.addDoorApi(new Door("", door_part_id, door_mf_url, catId, 2, door_cubes));
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
        return {
            gooeyMenuItems,
            gooeyMenuOpened,
            refBabylon,
            refPartsMenu,
            scheme,
            selectedPart,
            selectedPartId,
            selectedWallId,
            selectedFloorId,
            getAvailableArea,
            mode3D: computed(() => {
                if (mode.value === "view") {
                    return 3;
                } else {
                    return stateInOut.value === "in" ? 2 : 1;
                }
            }),
            eventHandle,
            onLogSchemeClick() {
                console.log("LogScheme: ", scheme);
            },
            onDeleteClick,
            onAddDoorClick,
            onUpdateWallClick,
            onUpdateFloorClick,
            state3D,
            stateRuler,
            stateSelect,
            // stateMetals,
            stateInOut,
            inOutStates,
            showMenu,
            mode,
            schemeMode,
            product,
            isNew: computed(() => schemeMode.value === "scheme-new"),
            isSelf: computed(() => schemeMode.value === "scheme-self"),
            isOther: computed(() => schemeMode.value === "scheme-other"),
            showCustomizeDlg,
            showOfferDlg,
            showMetalsDlg,
            customizeDlgTitle,
            loadingCreating,
            loadingCopying,
            titles: computed(() => {
                const { customerName } = store.state.currentCustomer;
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
            offer() {
                showOfferDlg.value = true;
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
                onCustomizeConfirm();
                // showCustomizeDlg.value = true;
            },
            continueEditScheme() {
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
                onCustomizeConfirm();
                // showCustomizeDlg.value = true;
            },
            onCustomizeConfirm,
            onCustomizeCancel() {
                showCustomizeDlg.value = false;
            },
            gotoBack() {
                // router.back();
                // TODO make sure scheme has saved.
                mode.value = "view";
            },
            // onSaveClick() {},
            // onOfferClick() {},
            // onSelectAllClick() {
            //     // stateSelect.value = stateSelect.value === "active" ? "" : "active";
            // },
            // onMetalsClick(val: string) {
            //     // stateMetals.value = stateMetals.value === "active" ? "" : "active";
            //     // showMenu.value = val === "active" ? true : false;
            //     showMetalsDlg.value = !showMetalsDlg.value;
            // },
            onInOutChange(val: string) {
                // showMenu.value = val === "active" ? true : false;
                showMenu.value = true;
            },
            // onPartsClick(val: string) {
            //     showMenu.value = !showMenu.value;
            // },
            onPartsMenuAction(action: ActionType) {
                switch (action) {
                    case "manifest":
                        ElMessage({
                            type: "warning",
                            message: "TODO: 清单",
                        });
                        break;
                    case "offer":
                        ElMessage({
                            type: "warning",
                            message: "TODO: 报价",
                        });
                        break;
                    case "save":
                        ElMessage({
                            type: "warning",
                            message: "TODO: 保存",
                        });
                        break;

                    default:
                        break;
                }
            },
            onPartSelect(part: Part, cat: PartCategory) {
                // TODO remove test code
                if (cat.id === 2) {
                    onDeleteClick("door");
                    onAddDoorClick("slide", +part.id);
                } else if (cat.id === 3) {
                    onDeleteClick("door");
                    onAddDoorClick("left", +part.id);
                } else {
                    selectedPart.value = {
                        id: +part.id,
                        width: part.width,
                        height: part.height,
                        depth: part.depth,
                        manifest: part.manifest,
                        catId: +cat.id,
                    };
                }
            },
            onBgSelect(bg: ImgCardItemType, bgType: BackgroundType) {
                if (bgType === BackgroundType.WALL) {
                    onUpdateWallClick(bg);
                } else {
                    onUpdateFloorClick(bg);
                }
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
        text-align: center;
        left: 0px;
        right: 0px;
        bottom: 82px;
        &-name,
        &-offer {
            font-size: 26px;
            font-weight: bold;
            color: black;
        }
        &-offer {
            font-size: 26px;
            margin-top: 15px;
        }

        &-action {
            margin-top: 27px;
            text-align: center;
            :deep(.el-button) {
                width: 220px;
            }
        }
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
</style>
