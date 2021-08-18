<template>
    <div class="material-item">
        <el-image class="material-item__img u-clickable" :src="material.pic" @click="onImgClick"></el-image>
        <el-radio v-bind="$attrs" :label="material.id.toString()">{{ material.name }}</el-radio>
    </div>
</template>

<script lang="ts">
import { MetaMaterial } from "@/api/interface/provider.interface";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "MaterialItem",
    props: {
        material: {
            type: Object as PropType<MetaMaterial>,
            default: () => ({}),
        },
    },
    setup(props, ctx) {
        return {
            onImgClick() {
                const myId = props.material.id.toString();
                const val = ctx.attrs.modelValue === myId ? "" : myId;
                ctx.emit("update:modelValue", val);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.material-item {
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
