<template>
    <div class="select-product">
        <app-header class="select-product__header" customer type="dark" back="退出新方案定制" />
        <prod-cat-menu class="select-product__menu" @select="onProdCatSelect" @filter="onProdFilter" />
        <el-row class="select-product__products" :gutter="20" justify="space-between">
            <el-col
                v-for="(p, index) in products"
                :key="index"
                :span="8"
                style="text-align: center; padding-top: 10px; padding-bottom: 10px"
            >
                <product-card :productName="p.name" :cover="p.cover" @detail="onProductClick(p)" />
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
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
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
        const products = reactive([] as Product[]);

        return {
            products,
            onBackClick() {
                router.back();
            },
            onProdCatSelect(cid: string) {
                apiProvider.requestProducts(cid).then((res) => {
                    if (res.ok) {
                        products.splice(0, products.length, ...(res.data || []));
                    }
                });
            },
            onProductClick(product: any) {
                router.push({
                    path: "/product-detail",
                    query: {
                        productId: product.id,
                    },
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
@import "~@/assets/scss/element-variables.scss";
.select-product {
    display: flex;
    position: relative;
    height: 100%;
    padding-top: 70px;
    overflow: hidden;
    &__menu {
        // width: 233px;
        overflow: hidden;
    }
    &__products {
        margin-left: 0px !important;
        flex: 1;
        overflow-y: auto;
        background-color: $--color-bg;
    }
}
</style>
