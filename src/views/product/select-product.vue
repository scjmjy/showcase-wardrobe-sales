<template>
    <div class="select-product">
        <app-header class="select-product__header" customer type="dark" />
        <prod-cat-menu class="select-product__menu" @select="onProdCatSelect" @filter="onProdFilter" />
        <el-scrollbar ref="elScrollbar" class="select-product__products" @scroll="onScroll">
            <product-skeleton v-if="loadingFirstpageProduct" />
            <el-row
                v-else-if="currentCid"
                ref="elRow"
                :gutter="20"
                justify="space-between"
                style="margin: 0px !important"
            >
                <!-- <transition-group name="el-zoom-in-top"> -->
                <el-col
                    v-for="p in products"
                    :key="p.id"
                    :span="12"
                    style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                >
                    <product-card :productName="p.name" :cover="p.pic" @detail="onProductClick(p)" />
                </el-col>
                <!-- </transition-group> -->
                <load-more :state="loadState" />
            </el-row>
        </el-scrollbar>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, DefineComponent, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import apiProvider from "@/api/provider";
import ProdCatMenu from "./components/ProdCatMenu.vue";
import ProductCard from "./components/ProductCard.vue";
import AppHeader from "../home/components/AppHeader.vue";
import { Product } from "@/api/interface/provider.interface";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import { ElScrollbar, ElRow } from "element-plus";
import ProductSkeleton from "./components/ProductSkeleton.vue";

export default defineComponent({
    name: "SelectProduct",
    components: {
        ProductCard,
        ProdCatMenu,
        AppHeader,
        LoadMore,
        ProductSkeleton,
    },
    setup() {
        const loadingFirstpageProduct = ref(false);
        const currentCid = ref("");
        const router = useRouter();
        const route = useRoute();
        const store = useStore();
        let products = ref<Product[]>([]);
        const elScrollbar = ref<InstanceType<typeof ElScrollbar>>();
        const elRow = ref<InstanceType<typeof ElRow>>();
        const loadState = ref<LOAD_STATE>("");
        let pageScroll: PageScroll<Product> | undefined;
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestProducts(currentCid.value, page, pageSize);
        }
        function onScroll(_e?: Event) {
            pageScroll?.onScroll();
        }
        onMounted(() => {
            const el = elScrollbar.value?.$el as HTMLElement;
            pageScroll = new PageScroll(el, requestApi, loadState, products, {
                onDataFinish() {
                    if (loadingFirstpageProduct.value) {
                        setTimeout(() => {
                            loadingFirstpageProduct.value = false;
                        }, 200);
                    }
                },
            });
        });

        return {
            loadingFirstpageProduct,
            currentCid,
            products,
            elScrollbar,
            elRow,
            loadState,
            onBackClick() {
                router.back();
            },
            async onProdCatSelect(cid: string) {
                currentCid.value = cid;
                loadingFirstpageProduct.value = true;
                pageScroll?.reload(300);
            },
            onProductClick(product: Product) {
                store.commit("SET-PAGE-CHANNEL", {
                    key: "productDetailData",
                    value: product,
                });
                router.push({
                    path: "/product-detail",
                    query: route.query,
                });
            },
            onProdFilter(filters: any) {
                console.log("【onProdFilter】", filters);
            },
            onScroll,
        };
    },
});
</script>

<style scoped lang="scss">
.select-product {
    display: flex;
    position: relative;
    height: 100%;
    padding-top: 70px;
    overflow: hidden;
    &__menu {
        // width: 233px;
        overflow-y: auto;
    }
    &__products {
        padding: 10px 0px;
        // margin-left: 0px !important;
        flex: 1;
        overflow-y: auto;
        background-color: var(--el-color-bg);
    }
}
</style>
