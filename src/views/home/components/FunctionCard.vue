<template>
    <div class="function-card clickable">
        <svg-icon class="function-card__img" :icon-class="icon"></svg-icon>
        <div class="function-card__title">
            <div>{{ functionName }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "FunctionCard",
    props: {
        icon: {
            type: String,
            default: "",
        },
        functionName: {
            type: String,
            default: "",
        },
    },
    setup() {
        return {};
    },
});
</script>

<style scoped lang="scss">
.function-card {
    display: inline-flex;
    flex-direction: column;

    vertical-align: top;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    margin: 5px;
    &__img {
        width: 80px !important;
        height: 80px !important;
    }
}
</style>
