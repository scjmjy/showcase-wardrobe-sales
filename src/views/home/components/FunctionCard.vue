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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    padding: 15px;
    width: 180px;
    height: 180px;
    background-color: white;
    &__icon {
        font-size: 65px;
    }
    &__name {
        margin-top: 16px;
        font-size: 22px;
        // font-weight: bold;
        color: #172021;
    }
}
</style>
