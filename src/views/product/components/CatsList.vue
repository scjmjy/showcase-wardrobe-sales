<template>
    <div>
        <div v-if="up" style="text-align: center">
            <el-button type="text" size="small" @click="$emit('up')">上一层</el-button>
        </div>
        <part-cat-card v-for="cat in cats" :key="cat.id" :cat="cat" @click="onCatClick">
            {{ cat.name }}
        </part-cat-card>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ProductCategory } from "@/api/interface/provider.interface";
import PartCatCard from "./PartCatCard.vue";

export default defineComponent({
    name: "CatsList",
    props: {
        up: {
            type: Boolean,
            default: false,
        },
        cats: {
            type: Array as PropType<ProductCategory[]>,
            default: () => [],
        },
    },
    emits: ["click", "up"],
    components: {
        PartCatCard,
    },
    setup(props, ctx) {
        return {
            onCatClick(cat: ProductCategory) {
                ctx.emit("click", cat, props.cats);
            },
        };
    },
});
</script>

<style scoped></style>
