<template>
    <div>{{ title }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
// vue 3 composition api
export default defineComponent({
    name: "DemoModel",
    setup() {
        const title = ref("This is demo-model page");
        return {
            title,
        };
    },
});
</script>

<style scoped></style>
