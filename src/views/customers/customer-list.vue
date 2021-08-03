<template>
    <div class="customer-list">
        <app-header class="customer-list__header" type="dark" customer />
        <customer-menu class="customer-list__menu" @select="onCustomerSelect" />
        <el-row class="customer-list__schemes" :gutter="20" justify="space-between">
            <el-col
                v-for="(s, index) in schemes"
                :key="index"
                :span="8"
                style="text-align: center; padding-top: 10px; padding-bottom: 10px"
            >
                <scheme-card :cover="s.cover" :name="s.name" />
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
import apiProvider from "@/api/provider";
import CustomerMenu from "./components/CustomerMenu.vue";
import AppHeader from "../home/components/AppHeader.vue";
import { Scheme } from "@/api/interface/provider.interface";
import SchemeCard from "./components/SchemeCard.vue";

export default defineComponent({
    name: "CustomerList",
    components: {
        CustomerMenu,
        AppHeader,
        SchemeCard,
    },
    setup() {
        const router = useRouter();
        const schemes = reactive([] as Scheme[]);

        return {
            schemes,
            onBackClick() {
                router.back();
            },
            onCustomerSelect(cid: string) {
                apiProvider.requestSchemes(cid).then((res) => {
                    if (res.ok) {
                        schemes.splice(0, schemes.length, ...(res.data || []));
                    }
                });
            },
            // onProductClick(product: any) {
            //     router.push({
            //         path: "/product-detail",
            //         query: {
            //             productId: product.id,
            //         },
            //     });
            // },
        };
    },
});
</script>

<style scoped lang="scss">
@import "~@/assets/scss/element-variables.scss";
.customer-list {
    display: flex;
    position: relative;
    height: 100%;
    padding-top: 70px;
    overflow: hidden;
    &__menu {
        width: 233px;
    }
    &__schemes {
        flex: 1;
        overflow-y: auto;
    }
}
</style>
