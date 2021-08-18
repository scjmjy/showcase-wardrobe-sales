<template>
    <template v-for="item of category.children" :key="item.id">
        <el-submenu v-if="item.children && item.children.length" :index="item.id + ''" :class="'el-submenu-' + level">
            <template #title>{{ item.name }}</template>
            <menu-item :category="item" :level="level + 1" />
        </el-submenu>
        <el-menu-item v-else :index="item.id + ''" :class="'el-menu-item-' + level">
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
        level: {
            type: Number,
            default: 2,
        },
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
