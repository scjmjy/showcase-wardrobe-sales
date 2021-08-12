<template>
    <div
        class="tab-pane-label"
        :class="{
            disabled: disabled,
        }"
    >
        <i class="tab-pane-label__icon iconfont" :class="'icon-' + icon" />
        <span class="tab-pane-label__label">{{ label }}</span>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        icon: {
            type: String,
            default: "",
        },
        label: {
            type: String,
            default: "",
        },
    },
    setup(props) {
        const store = useStore();
        return {};
    },
});
</script>

<style scoped lang="scss">
.tab-pane-label {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 5px;
    color: var(--el-color-primary) !important;

    &.disabled {
        color: #d8d8d8 !important;
        &:hover {
            color: var(--el-color-primary) !important;
        }
    }

    &__icon {
        color: inherit;
    }
    &__label {
        margin-top: 4px;
        font-size: 18px;
        font-weight: bold;
    }
}
</style>
