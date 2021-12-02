<template>
    <i
        class="iconfont fullscreen"
        :class="isFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'"
        @click="onClick"
    />
</template>

<script lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import screenfull from "screenfull";
import { ElMessage } from "element-plus";

export default {
    name: "Fullscreen",
    setup() {
        const isFullscreen = ref(false);
        function onChange() {
            isFullscreen.value = screenfull.isFullscreen;
        }
        function onClick() {
            if (!screenfull.isEnabled) {
                ElMessage.warning("您的浏览器不支持全屏功能！");
                return false;
            }
            screenfull.toggle();
        }
        onMounted(() => {
            if (screenfull.isEnabled) {
                screenfull.on("change", onChange);
            }
        });
        onBeforeMount(() => {
            if (screenfull.isEnabled) {
                screenfull.off("change", onChange);
            }
        });
        return {
            isFullscreen,
            onClick,
        };
    },
};
</script>

<style scoped>
.fullscreen {
    cursor: pointer;
    font-size: 30px;
}
</style>
