<template>
    <div class="function-card u-clickable">
        <i class="function-card__icon iconfont" :class="'icon-' + icon" :style="iconStyle"></i>
        <div class="function-card__name">
            <div>{{ functionName }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
    name: "FunctionCard",
    props: {
        icon: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            default: "",
        },
        functionName: {
            type: String,
            default: "",
        },
    },
    setup(props) {
        const iconStyle = computed(() => ({
            color: props.color,
        }));
        return {
            iconStyle,
        };
    },
});
</script>

<style scoped lang="scss">
.function-card {
    display: inline-flex;
    padding: 15px;
    flex-direction: column;
    align-items: center;
    // border-radius: 4px;
    // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    &__icon {
        font-size: 65px;
    }
    &__name {
        margin-top: 16px;
        font-size: 30px;
        font-weight: bold;
        color: #172021;
    }
}
</style>
