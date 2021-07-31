<template>
    <div class="product-detail">
        <Babylon class="product-detail__3d" />
        <div class="product-detail__right">
            <div class="product-detail__right-info">
                <span>{{ productName }}</span>
            </div>
            <div class="product-detail__right-actions">
                <el-button type="primary" round>开始定制</el-button>
                <el-button type="primary" round>继续定制</el-button>
                <el-button type="primary" round>报价</el-button>
                <el-button type="primary" round>由此方案定制</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Babylon from "@/components/Babylon.vue";
import { useRoute } from "vue-router";

export default defineComponent({
    name: "ProductDetail",
    components: {
        Babylon,
    },
    setup() {
        const route = useRoute();
        return {
            productName: ref(route.query.productId),
        };
    },
});
</script>

<style scoped lang="scss">
.product-detail {
    display: flex;
    &__right {
        display: flex;
        flex-direction: column;

        &-actions {
            :deep(.el-button) {
                margin-left: 0 !important;
                width: 150px;

                margin-top: 5px;
                margin-bottom: 5px;
            }
        }
    }
}
</style>
