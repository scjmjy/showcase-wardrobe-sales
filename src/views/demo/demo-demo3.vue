<template>
    <div>{{ title }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// vue 2 options api
export default defineComponent({
    name: "DemoDemo3",
    data() {
        return {
            title: "This is demo-demo3 page",
        };
    },
});
</script>

<style scoped></style>
