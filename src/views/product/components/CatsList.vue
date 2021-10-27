<template>
    <div class="cats-list">
        <part-cat-card v-for="cat in cats" :key="cat.id" :cat="cat" @click="onCatClick">
            {{ cat.name }}
        </part-cat-card>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PartCategory } from "@/api/interface/provider.interface";
import PartCatCard from "./PartCatCard.vue";

export default defineComponent({
    name: "CatsList",
    props: {
        up: {
            type: Boolean,
            default: false,
        },
        cats: {
            type: Array as PropType<PartCategory[]>,
            default: () => [],
        },
    },
    emits: ["click", "up"],
    components: {
        PartCatCard,
    },
    setup(props, ctx) {
        return {
            onCatClick(cat: PartCategory) {
                ctx.emit("click", cat, props.cats);
            },
            onUpClick() {
                // const isBg = props.cats.find((c) => !!c.btype);
                ctx.emit("up");
            },
        };
    },
});
</script>

<style scoped lang="scss">
.cats-list {
    overflow-y: auto;
    flex: 1;
}
</style>
