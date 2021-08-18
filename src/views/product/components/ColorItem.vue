<template>
    <div class="color-item">
        <!-- <el-image class="color-item__img u-clickable" :src="color.pic" @click="onColorClick"></el-image> -->
        <div
            class="color-item__color u-clickable"
            :class="{ active: active }"
            :style="colorStyle"
            @click="onColorClick"
        ></div>
        <span class="color-item__label">{{ color.name }}</span>
        <i v-if="active" class="color-item__check el-icon-check" />
    </div>
</template>

<script lang="ts">
import { MetaColor } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
    name: "ColorItem",
    props: {
        color: {
            type: Object as PropType<MetaColor>,
            default: () => ({}),
        },
        modelValue: {
            type: String,
            default: "",
        },
    },
    setup(props, ctx) {
        return {
            active: computed(() => props.modelValue === props.color.id.toString()),
            colorStyle: computed(() => ({
                "background-color": props.color.hex,
            })),
            onColorClick() {
                const myId = props.color.id.toString();
                const val = props.modelValue === myId ? "" : myId;
                ctx.emit("update:modelValue", val);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.color-item {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
    &__color {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-bottom: 8px;

        &.active {
            border: 2px solid red;
        }
    }
    &__label {
        font-size: 12px;
        color: var(--el-color-black);
    }
    &__check {
        position: absolute;
        top: 3px;
        color: var(--el-color-primary);
        font-weight: bolder;
        font-size: xx-large;
        pointer-events: none;
    }
}
</style>
