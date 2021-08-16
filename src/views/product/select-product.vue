<template>
    <div class="select-product">
        <app-header class="select-product__header" customer type="dark" />
        <prod-cat-menu class="select-product__menu" @select="onProdCatSelect" @filter="onProdFilter" />
        <el-row ref="refProdList" class="select-product__products" :gutter="20" justify="space-between">
            <el-col
                v-for="(p, index) in products"
                :key="index"
                :span="12"
                style="text-align: center; padding-top: 10px; padding-bottom: 10px"
            >
                <product-card :productName="p.name" :cover="p.pic" @detail="onProductClick(p)" />
            </el-col>
        </el-row>
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
import { defineComponent, reactive, ref, DefineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import apiProvider from "@/api/provider";
import ProdCatMenu from "./components/ProdCatMenu.vue";
import ProductCard from "./components/ProductCard.vue";
import AppHeader from "../home/components/AppHeader.vue";
import { Product } from "@/api/interface/provider.interface";

export default defineComponent({
    name: "SelectProduct",
    components: {
        ProductCard,
        ProdCatMenu,
        AppHeader,
    },
    setup() {
        const router = useRouter();
        const store = useStore();
        const products = reactive([] as Product[]);
        const refProdList = ref<InstanceType<DefineComponent>>();

        return {
            products,
            refProdList,
            onBackClick() {
                router.back();
            },
            onProdCatSelect(cid: string) {
                apiProvider.requestProducts(cid).then((res) => {
                    if (res.ok) {
                        products.splice(0, products.length, ...(res.data || []));
                        refProdList.value?.$el.scrollTo({ top: 0, behavior: "smooth" });
                    }
                });
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
