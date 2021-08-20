<template>
    <div class="img-radio-item">
        <el-image class="img-radio-item__img u-clickable" :src="option.url" @click="onClick"></el-image>
        <el-radio v-bind="$attrs" :label="option.value" @change="onClick">{{ option.label }}</el-radio>
    </div>
</template>

<script lang="ts">
import { LabelValue } from "@/api/interface/common.interfact";
import { defineComponent, PropType } from "vue";

export interface ImgRadioItemType {
    label: string;
    value: string | number;
    url: string;
}

export default defineComponent({
    name: "ImgRadioItem",
    props: {
        option: {
            type: Object as PropType<LabelValue>,
            default: () => ({}),
        },
    },
    emits: ["update:modelValue", "change"],
    setup(props, ctx) {
        return {
            onClick() {
                const myVal = props.option.value;
                const val = ctx.attrs.modelValue === myVal ? "" : myVal;
                ctx.emit("update:modelValue", val);
                ctx.emit("change", val);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.img-radio-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin: 10px;
    &__img {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        margin-bottom: 8px;
    }
    :deep(.el-radio__label) {
        font-size: 12px;
        vertical-align: middle;
        color: var(--el-color-black);
    }
}
</style>
