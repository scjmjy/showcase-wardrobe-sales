<template>
    <div class="img-card-item" :class="{ active: active }">
        <el-image class="img-card-item__img u-clickable" :src="option.url" fit="contain" @click="onImgClick"></el-image>
        <div class="img-card-item__label">{{ option.label }}</div>
    </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { defineComponent, PropType } from "vue";

export interface ImgCardItemType {
    label: string;
    value: string | number;
    url: string;
}

export default defineComponent({
    name: "ImgCardItem",
    props: {
        option: {
            type: Object as PropType<ImgCardItemType>,
            default: () => ({}),
        },
        modelValue: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue", "click"],
    setup(props, ctx) {
        return {
            active: computed(() => props.modelValue === props.option.value),
            onImgClick() {
                ctx.emit("update:modelValue", props.option.value);
                ctx.emit("click", props.option);
            },
        };
    },
});
</script>

<style scoped lang="scss">
@use "~@/assets/scss/business.scss" as *;

.img-card-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: top;
    margin: $card-margin;
    width: $card-width;
    &__img {
        width: 100%;
        height: 100%;
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
