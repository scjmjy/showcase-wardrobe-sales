<template>
    <div class="divider-h">
        <div class="divider-h__line"></div>
        <span class="divider-h__text">
            <slot />
        </span>
        <div class="divider-h__line"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "DividerH",
    props: {},
    setup() {
        return {};
    },
});
</script>

<style scoped lang="scss">
.divider-h {
    width: 100%;
    display: flex;
    align-items: center;
    margin: 12px 0;

    &__line {
        height: 1px;
        flex: 1;
        background-color: var(--el-color-primary);
    }
    &__text {
        padding: 0 24px;
        color: var(--el-color-primary);
    }
}
</style>
