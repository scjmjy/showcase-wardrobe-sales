<template>
    <div class="product-detail">
        <app-header type="dark" customer :stop="false" :back="backText" />
        <!-- <Babylon class="product-detail__3d" /> -->
        <img class="product-detail__3d" src="@/assets/img/demo/demo-wardrobe.png" />
        <div class="product-detail__right">
            <div class="product-detail__right-info">
                <span>{{ product.name }}</span>
                <br />
                <span v-if="!isNew">{{ product.offer || "待报价" }}</span>
            </div>
            <div class="product-detail__right-actions">
                <el-button type="primary" round v-if="isNew" @click="newScheme">开始定制</el-button>
                <el-button type="primary" round v-if="isSelf" @click="continueEditScheme">继续定制</el-button>
                <el-button type="primary" round v-if="isSelf" @click="offer">{{
                    product.offer ? "重新报价" : "报价"
                }}</el-button>
                <el-button type="primary" round v-if="isSelf || isOther" @click="copyScheme">由此方案定制</el-button>
            </div>
        </div>

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
import { computed, defineComponent, ref, watch, Ref } from "vue";
// import Babylon from "@/components/Babylon/Babylon.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
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
        // Babylon,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const store = useStore();

        const product = ref({} as Product | Scheme | undefined);

        const mode = computed<"scheme-new" | "scheme-self" | "scheme-other">(() => {
            let p = product as Ref<Scheme | undefined>;
            if (!p.value || !p.value.pid) {
                // 没有 product id，说明是通过商品定制新方案
                return "scheme-new";
            }
            return p.value.cid === store.state.currentCustomer.customerId + "" ? "scheme-self" : "scheme-other";
        });
        watch(
            () => route.query.productId as string,
            (productId) => {
                if (productId) {
                    apiProvider.requestProductDetail(productId).then((res) => {
                        if (res.ok) {
                            Object.assign(product.value, res.data);
                        }
                    });
                }
            },
            {
                immediate: true,
            },
        );
        watch(
            () => route.query.schemeId as string,
            (schemeId) => {
                if (schemeId) {
                    apiProvider.requestSchemeDetail(schemeId).then((res) => {
                        if (res.ok) {
                            Object.assign(product.value, res.data);
                        }
                    });
                }
            },
            {
                immediate: true,
            },
        );
        const customizeMode = ref<"new" | "continue" | "copy">("new");
        const showCustomizeDlg = ref(false);
        const showOfferDlg = ref(false);

        function gotoEditScheme() {
            let p = product as Ref<Scheme | undefined>;
            if (!p.value) {
                return;
            }
            router.push({
                path: "/scheme-detail",
                query: {
                    [p.value.pid ? "schemeId" : "productId"]: p.value.id,
                    mode: customizeMode.value,
                },
            });
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

        return {
            mode,
            product,
            isNew: computed(() => mode.value === "scheme-new"),
            isSelf: computed(() => mode.value === "scheme-self"),
            isOther: computed(() => mode.value === "scheme-other"),
            backText: computed(() => {
                switch (mode.value) {
                    case "scheme-new":
                        return "退出新方案定制";
                    case "scheme-self":
                    case "scheme-other":
                        return "退出方案详情";
                    default:
                        return "";
                }
            }),
            showCustomizeDlg,
            showOfferDlg,
            customizeDlgTitle,
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
        };
    },
});
</script>

<style scoped lang="scss">
@import "~@/assets/scss/element-variables.scss";

.product-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 70px 20px 20px;
    background-color: $--color-bg;
    &__3d {
        // flex: 1;
        // overflow: auto;
        width: 800px;
        height: 600px;
    }
    &__right {
        display: flex;
        flex-direction: column;

        &-actions {
            margin-top: 40px;
            :deep(.el-button) {
                display: block;
                width: 220px;
                margin-left: 0 !important;
                margin-top: 20px;
                margin-bottom: 20px;
            }
        }
    }
}
</style>
