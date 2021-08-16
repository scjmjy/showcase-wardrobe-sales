<template>
    <div class="part-cat-card u-clickable" :class="{ active: active }">
        <el-image class="part-cat-card__img" :src="cat.pic" fit="contain" @click="$emit('select', cat)"></el-image>
        <div class="part-cat-card__label">{{ cat.name }}</div>
    </div>
</template>

<script lang="ts">
import { PartCategory } from "@/api/interface/provider.interface";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "PartCatCard",
    props: {
        cat: {
            type: Object as PropType<PartCategory>,
            default: () => ({}),
        },
        active: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        return {};
    },
});
</script>

<style scoped lang="scss">
.part-cat-card {
    &__img {
        width: 140px;
        height: 140px;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
        border-radius: 10px;
        overflow: hidden;
        background-color: white;
    }
    &__label {
        margin-top: 10px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: var(--el-color-black);
    }

    &.active &__img {
        border: 3px solid var(--el-color-primary);
    }
}
</style>
