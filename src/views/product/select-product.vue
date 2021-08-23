<template>
    <div class="select-product">
        <app-header class="select-product__header" customer type="dark" />
        <prod-cat-menu class="select-product__menu" @select="onProdCatSelect" @filter="onProdFilter" />
        <el-scrollbar ref="elScrollbar" class="select-product__products" @scroll="onScroll">
            <el-row v-if="currentCid" ref="elRow" :gutter="20" justify="space-between" style="margin: 0px !important">
                <el-col
                    v-for="(p, index) in products"
                    :key="index"
                    :span="12"
                    style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                >
                    <product-card :productName="p.name" :cover="p.pic" @detail="onProductClick(p)" />
                </el-col>
                <load-more :state="loadState" />
            </el-row>
        </el-scrollbar>
        <!-- <el-tabs class="select-product__tabs" tab-position="left">
            <el-tab-pane v-for="(c, index) of products" :key="index" :label="c.categoryName">
                <product-card
                    v-for="(p, index2) of c.products"
                    :key="index2"
                    :productName="p.name"
                    :img="p.img"
                    @click="onProductClick(p)"
                />
            </el-tab-pane>
        </el-tabs>

        <el-button icon="el-icon-arrow-left" @click="onBackClick" /> -->
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, DefineComponent, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import apiProvider from "@/api/provider";
import ProdCatMenu from "./components/ProdCatMenu.vue";
import ProductCard from "./components/ProductCard.vue";
import AppHeader from "../home/components/AppHeader.vue";
import { Product } from "@/api/interface/provider.interface";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import { ElScrollbar, ElRow } from "element-plus";

export default defineComponent({
    name: "SelectProduct",
    components: {
        ProductCard,
        ProdCatMenu,
        AppHeader,
        LoadMore,
    },
    setup() {
        const loadingProduct = ref(false);
        const currentCid = ref("");
        const router = useRouter();
        const store = useStore();
        let products = ref<Product[]>([]);
        const elScrollbar = ref<InstanceType<typeof ElScrollbar>>();
        const elRow = ref<InstanceType<typeof ElRow>>();
        const loadState = ref<LOAD_STATE>("");
        let pageScroll: PageScroll<Product> | undefined;
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestProducts(currentCid.value, page, pageSize);
        }
        function onScroll(e?: Event) {
            pageScroll?.onScroll();
        }
        onMounted(() => {
            const el = elScrollbar.value?.$el as HTMLElement;
            pageScroll = new PageScroll(el, requestApi, loadState, products, {
                onDataFinish() {
                    setTimeout(() => {
                        loadingProduct.value = false;
                    }, 200);
                },
            });
        });

        return {
            loadingProduct,
            currentCid,
            products,
            elScrollbar,
            elRow,
            loadState,
            onBackClick() {
                router.back();
            },
            onProdCatSelect(cid: string) {
                currentCid.value = cid;
                pageScroll?.reload();
                loadingProduct.value = true;
            },
            onProductClick(product: Product) {
                store.commit("SET-PAGE-CHANNEL", {
                    key: "productDetailData",
                    value: product,
                });
                router.push({
                    path: "/product-detail",
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
