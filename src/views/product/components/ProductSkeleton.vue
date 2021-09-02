<template>
    <el-row :gutter="20" justify="space-between" style="margin: 0px !important">
        <el-col v-for="p in 4" :key="p" :span="12" style="text-align: center; padding-top: 10px; padding-bottom: 10px">
            <product-card-skeleton />
        </el-col>
    </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProductCardSkeleton from "./ProductCardSkeleton.vue";

export default defineComponent({
    components: {
        ProductCardSkeleton,
    },
    setup() {
        return {};
    },
});
</script>

<style scoped></style>
