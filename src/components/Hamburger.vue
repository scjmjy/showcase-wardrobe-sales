<template>
    <div class="hamburger" :class="{ ['hamburger--' + type]: true, 'is-active': modelValue }" @click="onClick">
        <div class="hamburger-box">
            <div class="hamburger-inner"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Hamburguer",
    props: {
        type: {
            type: String,
            default: "arrow",
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, ctx) {
        function onClick() {
            const newVal = !props.modelValue;
            ctx.emit("update:modelValue", newVal);
            ctx.emit("change", newVal);
        }
        return {
            onClick,
        };
    },
});
</script>

<style scoped lang="scss"></style>
