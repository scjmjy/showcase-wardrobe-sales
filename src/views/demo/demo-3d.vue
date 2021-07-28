<template>
    <div>{{ title }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// vue 2 options api
export default defineComponent({
    name: "Demo3D",
    data() {
        return {
            title: "This is demo-3d page",
        };
    },
});
</script>

<style scoped></style>
