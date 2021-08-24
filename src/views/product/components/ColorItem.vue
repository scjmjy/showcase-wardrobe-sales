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
        <i v-if="active" class="color-item__check el-icon-check" :style="checkStyle" />
    </div>
</template>

<script lang="ts">
import { MetaColor } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType } from "vue";
import { getContrastYIQ } from "@/utils/color";

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
    emits: ["update:modelValue", "change"],
    setup(props, ctx) {
        return {
            active: computed(() => props.modelValue === props.color.id.toString()),
            colorStyle: computed(() => ({
                "background-color": props.color.hex,
            })),
            checkStyle: computed(() => ({
                color: getContrastYIQ(props.color.hex),
            })),
            onColorClick() {
                const myId = props.color.id.toString();
                const val = props.modelValue === myId ? "" : myId;
                ctx.emit("update:modelValue", val);
                ctx.emit("change", val);
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
        margin-bottom: 8px;
        // border: 2px solid white;
        border-radius: 50%;
        box-shadow: rgb(0 0 0 / 20%) 0px 0px 0px 1px;

        // transition: all 0.3s ease;
        &.active {
            // border: 2px solid red;
            box-shadow: rgb(0 0 0 / 20%) 0px 0px 0px 5px;
        }
    }
    &__label {
        font-size: 12px;
        color: var(--el-color-black);
    }
    &__check {
        position: absolute;
        top: 6px;
        // color: var(--el-color-primary);
        font-weight: bolder;
        font-size: x-large;
        pointer-events: none;
    }
}
</style>
