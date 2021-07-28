<template>
    <div>{{ title }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// vue 2 options api
export default defineComponent({
    name: "DemoAccesory",
    data() {
        return {
            title: "This is demo-accesory page",
        };
    },
});
</script>

<style scoped></style>
