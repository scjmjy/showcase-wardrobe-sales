<template>
    <template v-for="item of category.children" :key="item.id">
        <el-submenu v-if="item.children && item.children.length" :index="item.id + ''">
            <template #title>{{ item.name }}</template>
            <menu-item :category="item" />
        </el-submenu>
        <el-menu-item v-else :index="item.id + ''">
            <template #title>{{ item.name }}</template>
        </el-menu-item>
    </template>
</template>

<script lang="ts">
import { ProductCategory } from "@/api/interface/provider.interface";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "MenuItem",
    props: {
        category: {
            type: Object as PropType<ProductCategory>,
            required: true,
        },
    },
    setup() {
        return {};
    },
});
</script>

<style scoped></style>
