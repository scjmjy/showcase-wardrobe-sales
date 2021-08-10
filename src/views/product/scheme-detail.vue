<template>
    <div class="product-detail">
        <app-header type="dark" customer :stop="false" back="退出编辑" />
        <!-- <Babylon class="product-detail__3d" /> -->
        <img class="product-detail__3d" src="@/assets/img/demo/demo-wardrobe.png" />
        <div class="product-detail__right">编辑方案</div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, Ref } from "vue";
// import Babylon from "@/components/Babylon.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { Product, Scheme } from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import AppHeader from "@/views/home/components/AppHeader.vue";

export default defineComponent({
    name: "SchemeDetail",
    components: {
        AppHeader,
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
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }
    }
}
</style>
