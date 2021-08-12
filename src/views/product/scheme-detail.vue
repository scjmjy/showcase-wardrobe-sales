<template>
    <div class="product-detail">
        <!-- <app-header type="dark" customer :stop="false" back="退出编辑" /> -->
        <div class="product-detail__title">
            <el-button class="product-detail__title-backBtn" icon="el-icon-back" circle  @click="gotoBack"></el-button>
            <el-button class="product-detail__title-backText" type="text" @click="gotoBack">返回</el-button>
        </div>
        <!-- <Babylon class="product-detail__3d" /> -->
        <img class="product-detail__3d" src="@/assets/img/demo/demo-wardrobe.png" />
        <el-collapse-transition-h>
            <div v-show="showMenu" class="product-detail__2d">编辑方案</div>
        </el-collapse-transition-h>
        <div class="product-detail__action-left">
            <el-button class="" icon="el-icon-download" circle></el-button>
            <el-button class="" icon="el-icon-s-promotion" circle></el-button>
        </div>
        <div class="product-detail__action-right">
            <el-button class="" icon="el-icon-info" circle @click="showMenu = !showMenu"></el-button>
            <el-button class="" icon="el-icon-info" circle @click="showMenu = !showMenu"></el-button>
            <el-button class="" icon="el-icon-info" circle @click="showMenu = !showMenu"></el-button>
            <el-button class="" icon="el-icon-info" circle @click="showMenu = !showMenu"></el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, Ref } from "vue";
// import Babylon from "@/components/Babylon.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { Product, Scheme } from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
// import AppHeader from "@/views/home/components/AppHeader.vue";

export default defineComponent({
    name: "SchemeDetail",
    components: {
        // AppHeader,
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
            return p.value.cid === store.state.currentCustomer.customerId ? "scheme-self" : "scheme-other";
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

        const showMenu = ref(false);
        return {
            mode,
            product,
            showMenu,
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
            // productName: ref(route.query.productId),
            startEditScheme() {
                let p = product as Ref<Scheme | undefined>;
                if (!p.value) {
                    return;
                }
                router.push({
                    path: "/scheme",
                    query: {
                        [p.value.pid ? "schemeId" : "productId"]: p.value.id,
                    },
                });
            },
            offer() {
                console.log("【offer】");
            },
            copyScheme() {
                console.log("copyScheme");
            },
            gotoBack() {
                router.back();
            },
        };
    },
});
</script>

<style scoped lang="scss">
.product-detail {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 70px 20px 20px;
    background-color: var(--el-color-bg);
    &__title {
        position: absolute;
        display: flex;
        align-items: center;
        padding: 0px 20px;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 70px;
        background-color: lightblue;

        &-backText {
            // margin-left: 10px;
        }
    }
    &__3d {
        // flex: 1;
        // overflow: auto;
        width: 800px;
        height: 600px;
    }
    &__2d {
        position: absolute;
        display: flex;
        flex-direction: column;
        background-color: lightcoral;
        top: 80px;
        bottom: 80px;
        right: 0px;
        width: 200px;
    }
    &__action-left {
        position: absolute;
        left: 60px;
        bottom: 60px;
        :deep(.el-button) {
            display: block;
            margin-left: 0 !important;
            margin-top: 15px;
            margin-bottom: 15px;
        }
    }
    &__action-right {
        position: absolute;
        right: 60px;
        bottom: 60px;
    }
}
</style>
