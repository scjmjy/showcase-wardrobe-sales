<template>
    <div class="part-card" :class="{ active: active }">
        <el-image
            class="part-card__img u-clickable"
            :src="part.pic"
            fit="contain"
            @click="$emit('click', part)"
        ></el-image>
        <div class="part-card__label">{{ part.name }}</div>
    </div>
</template>

<script lang="ts">
import { Part } from "@/api/interface/provider.interface";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "PartCard",
    props: {
        part: {
            type: Object as PropType<Part>,
            default: () => ({}),
        },
        active: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["click"],
    setup() {
        return {};
    },
});
</script>

<style scoped lang="scss">
.part-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: top;
    margin: 10px;
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
