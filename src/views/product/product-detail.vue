<template>
    <div v-if="product" class="product-detail">
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
        <Babylon class="product-detail__3d" :scheme="scheme" @click="showMenu = false" />
        <!-- <img class="product-detail__3d" src="@/assets/img/demo/demo-wardrobe.png" /> -->

        <el-collapse-transition-h @after-leave="mode = 'edit'">
            <div v-if="mode === 'view'" class="product-detail__action-customize">
                <div>
                    <el-button type="primary" round v-if="isNew" @click="newScheme">开始定制</el-button>
                    <el-button type="primary" round v-if="isSelf" @click="continueEditScheme">继续定制</el-button>
                    <el-button type="primary" round v-if="isSelf && !product.offer" @click="offer">报价</el-button>
                    <el-button type="primary" round v-if="isSelf || isOther" @click="copyScheme"
                        >由此方案定制</el-button
                    >
                </div>
            </div>
        </el-collapse-transition-h>
        <div v-if="mode === 'view'" class="product-detail__info">
            <div class="product-detail__info-name">{{ product.name }}</div>
            <div v-if="!isNew" class="product-detail__info-offer">{{ product.offer || "待报价" }}</div>
        </div>
        <template v-if="mode === 'edit'">
            <el-button class="product-detail__back" icon="el-icon-arrow-left" type="text" @click="gotoBack"
                >返回</el-button
            >
            <div class="product-detail__action-left state-icon-group-v">
                <state-icon icon="save" label="保存" @click="onSaveClick"></state-icon>
                <state-icon icon="offer" label="报价" @click="onOfferClick"></state-icon>
            </div>
            <div class="product-detail__action-right state-icon-group-h">
                <state-icon v-model="stateSelect" icon="select-all" label="全选" @click="onSelectAllClick"></state-icon>
                <state-icon v-model="stateMetals" icon="metals" label="五金" @click="onMetalsClick"></state-icon>
                <state-icon
                    v-model="stateInOut"
                    icon="parts-indoor"
                    :states="inOutStates"
                    @click="onInOutClick"
                ></state-icon>
                <state-icon
                    icon="parts"
                    label="部件"
                    iconColor="white"
                    iconBg="#5EB6B3"
                    @click="onPartsClick"
                ></state-icon>
            </div>
            <el-collapse-transition-h>
                <div v-if="mode === 'edit' && showMenu" class="product-detail__menu2d">商品菜单</div>
            </el-collapse-transition-h>
        </template>
        <customize-dlg
            v-model="showCustomizeDlg"
            :title="customizeDlgTitle"
            @confirm="onEditSchemeConfirm"
            @cancel="onNewSchemeCancel"
        />
        <offer-dlg v-model="showOfferDlg" title="报价" @confirm="showOfferDlg = false" @cancel="showOfferDlg = false" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, Ref, nextTick } from "vue";
import Babylon from "@/components/Babylon/Babylon.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { StateType } from "@/store";
import { Product, Scheme } from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import AppHeader from "@/views/home/components/AppHeader.vue";
import CustomizeDlg from "./components/CustomizeDlg.vue";
import OfferDlg from "./components/OfferDlg.vue";

export default defineComponent({
    name: "ProductDetail",
    components: {
        AppHeader,
        CustomizeDlg,
        OfferDlg,
        Babylon,
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
            return p.cid === store.state.currentCustomer.customerId + "" ? "scheme-self" : "scheme-other";
        });
        // watch(
        //     () => route.query.productId as string,
        //     (productId) => {
        //         if (productId) {
        //             apiProvider.requestProductDetail(productId).then((res) => {
        //                 if (res.ok) {
        //                     Object.assign(product.value, res.data);
        //                 }
        //             });
        //         }
        //     },
        //     {
        //         immediate: true,
        //     },
        // );
        // watch(
        //     () => route.query.schemeId as string,
        //     (schemeId) => {
        //         if (schemeId) {
        //             apiProvider.requestSchemeDetail(schemeId).then((res) => {
        //                 if (res.ok) {
        //                     Object.assign(product.value, res.data);
        //                 }
        //             });
        //         }
        //     },
        //     {
        //         immediate: true,
        //     },
        // );
        const customizeMode = ref<"new" | "continue" | "copy">("new");
        const showCustomizeDlg = ref(false);
        const showOfferDlg = ref(false);

        async function gotoEditScheme() {
            showCustomizeDlg.value = false;
            // await nextTick();
            mode.value = "";
            // let p = product as Ref<Scheme>;
            // // if (!p.value) {
            // //     return;
            // // }
            // router.push({
            //     path: "/scheme-detail",
            //     query: {
            //         [p.value.pid ? "schemeId" : "productId"]: p.value.id,
            //         mode: customizeMode.value,
            //     },
            // });
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

        const stateSelect = ref<"active" | "">("");
        const stateMetals = ref<"active" | "">("");
        const stateInOut = ref<"in" | "out">("in");
        const inOutStates = {
            in: {
                label: "内配",
                iconBg: "black",
                iconColor: "#D8D8D8",
            },
            out: {
                label: "外配",
            },
        };
        return {
            stateSelect,
            stateMetals,
            stateInOut,
            inOutStates,
            scheme: require("@/assets/mf/scheme.json"),
            showMenu,
            mode,
            schemeMode,
            product,
            isNew: computed(() => schemeMode.value === "scheme-new"),
            isSelf: computed(() => schemeMode.value === "scheme-self"),
            isOther: computed(() => schemeMode.value === "scheme-other"),
            showCustomizeDlg,
            showOfferDlg,
            customizeDlgTitle,
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
                customizeMode.value = "new";
                showCustomizeDlg.value = true;
            },
            continueEditScheme() {
                customizeMode.value = "continue";
                gotoEditScheme();
            },
            copyScheme() {
                customizeMode.value = "copy";
                showCustomizeDlg.value = true;
            },
            onEditSchemeConfirm() {
                gotoEditScheme();
            },
            onNewSchemeCancel() {
                showCustomizeDlg.value = false;
            },
            gotoBack() {
                // router.back();
                // TODO make sure scheme has saved.
                mode.value = "view";
            },
            onSaveClick() {},
            onOfferClick() {},
            onSelectAllClick() {
                stateSelect.value = stateSelect.value === "active" ? "" : "active";
            },
            onMetalsClick() {
                stateMetals.value = stateMetals.value === "active" ? "" : "active";
                showMenu.value = true;
            },
            onInOutClick() {
                stateInOut.value = stateInOut.value === "in" ? "out" : "in";
                showMenu.value = true;
            },
            onPartsClick() {
                showMenu.value = true;
            },
        };
    },
});
</script>

<style scoped lang="scss">
@import "~@/assets/scss/element-variables.scss";

.product-detail {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: $--color-bg;
    &__3d {
        // flex: 1;
        // overflow: auto;
        // width: 800px;
        // height: 600px;
        // width: 100%;
        flex: 1;
        height: 100%;
        overflow: hidden;
    }

    &__action-customize {
        width: 280px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        :deep(.el-button) {
            display: block;
            width: 220px;
            margin-left: 0 !important;
            margin-bottom: 40px;
            // margin-top: 20px;
            // margin-bottom: 20px;
        }
    }
    &__back {
        position: absolute;
        left: 50px;
        top: 50px;
        font-size: 26px;
        color: black !important;
    }
    &__menu2d {
        position: absolute;
        display: flex;
        flex-direction: column;
        background-color: lightcoral;
        top: 80px;
        bottom: 200px;
        right: 0px;
        width: 200px;
    }
    &__info {
        position: absolute;
        text-align: center;
        left: 0px;
        right: 280px;
        bottom: 82px;
        &-name,
        &-offer {
            font-size: 26px;
            font-weight: bold;
            color: black;
        }
        &-offer {
            font-size: 26px;
            margin-top: 27px;
        }
    }
    &__action-left {
        position: absolute;
        left: 60px;
        bottom: 60px;
        :deep(.el-button) {
            display: block;
            margin-left: 0 !important;
            margin-top: 20px;
            margin-bottom: 20px;
        }
    }
    &__action-right {
        position: absolute;
        right: 60px;
        bottom: 60px;
    }
}
</style>
