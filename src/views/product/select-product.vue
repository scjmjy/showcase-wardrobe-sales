<template>
    <div class="select-product">
        <div class="select-product__title">请选择商品，开始定制</div>
        <el-tabs class="select-product__tabs" tab-position="left">
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

        <el-button icon="el-icon-arrow-left" @click="onBackClick" />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
import ProductCard from "./components/ProductCard.vue";

export default defineComponent({
    name: "SelectProduct",
    components: {
        ProductCard,
    },
    setup() {
        const products = new Array(10).fill(0).map((val, index) => {
            return {
                categoryName: "分类" + index,
                products: new Array(10).fill(0).map((val2, index2) => ({
                    id: "" + index + index2,
                    name: "产品" + index + index2,
                    img: "https://picsum.photos/300/300?random=" + index + index2,
                })),
            };
        });

        const router = useRouter();

        return {
            products: reactive(products),
            onBackClick() {
                router.back();
            },
            onProductClick(product: any) {
                router.push({
                    path: "/product-detail",
                    query: {
                        productId: product.id,
                    },
                });
            },
        };
    },
});
</script>

<style scoped lang="scss">
.select-product {
    &__title {
        font-size: 30px;
        font-weight: bold;
    }
}
</style>
