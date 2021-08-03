<template>
    <div class="ball" :style="ballStyle"></div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
    props: {
        color: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
    },
    setup(props) {
        const ballStyle = computed(
            () => `background: linear-gradient(54deg, ${props.color[0]} 0%,  ${props.color[1]} 100%);`,
        );
        return {
            ballStyle,
        };
    },
});
</script>

<style scoped lang="scss">
@keyframes ease-zoom-move {
    from {
        transform: scale(1) translate(0, 0);
    }

    to {
        transform: scale(1.1) translate(10%, 10%);
    }
}

.ball {
    border-radius: 50%;
    overflow: hidden;
    animation: 3s ease-in-out infinite alternate ease-zoom-move;
}
</style>
