<template>
    <div class="metal-item">
        <el-image class="metal-item__img" :src="url"></el-image>
        <div class="metal-item__name">{{ name }}</div>
        <el-input-number class="metal-item__count" v-bind="$attrs" :min="0" label="数量"></el-input-number>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
    name: "MetalItem",
    props: {
        name: {
            type: String,
            default: "",
        },
        url: {
            type: String,
            default: "",
        },
    },
    setup() {
        return {};
    },
});
</script>

<style lang="scss" scoped>
.metal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__img {
        width: 80px;
        height: 80px;
    }
    &__name {
        font-size: 26px;
        font-weight: bold;
    }
}
</style>
