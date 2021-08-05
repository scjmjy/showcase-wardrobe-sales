<template>
    <div class="fluid-bg">
        <ball class="fluid-bg__ball-1" :color="['#05B3BB', '#16C6CE']" />
        <ball class="fluid-bg__ball-2" :color="['#05B3BB', '#16C6CE']" />
        <ball class="fluid-bg__ball-3" :color="['#13D4C7', '#13D4C7']" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Ball from "./Ball.vue";

export default defineComponent({
    name: "FluidBg",
    components: {
        Ball,
    },
    setup() {
        return {};
    },
});
</script>

<style scoped lang="scss">
.fluid-bg {
    position: relative;
    z-index: -1;
    background-color: #0cc3c0;
    clip-path: ellipse(100% 100% at 50% 0%);
    overflow: hidden;

    &__ball-1 {
        position: absolute;
        left: -5%;
        top: 30%;
        width: 202px;
        height: 202px;
    }

    &__ball-2 {
        position: absolute;
        left: 50%;
        top: -50%;
        width: 535px;
        height: 535px;
    }
    &__ball-3 {
        position: absolute;
        right: -5%;
        top: 50%;
        width: 298px;
        height: 298px;
    }
}
</style>
