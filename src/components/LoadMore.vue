<template>
    <div class="load-more" :class="type" v-loading="state === 'loading'" @click="onClick">
        {{ stateText }}
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, Prop, PropType } from "vue";
import { LOAD_STATE } from "@/utils/page-scroll";

export default defineComponent({
    name: "LoadMore",
    props: {
        state: {
            type: String as PropType<LOAD_STATE>,
            default: "",
        },
        type: {
            type: String as PropType<"primary" | "smoke">,
            default: "primary",
        },
    },
    emits: ["loadmore"],
    setup(props, ctx) {
        const stateText = computed(() => {
            switch (props.state) {
                case "loading":
                    return "加载中...";
                case "nomore":
                    return "-- 没有更多了 --";
                case "more":
                    return "↑点击加载更多↑";

                default:
                    return "";
            }
        });
        return {
            stateText,
            onClick() {
                if (props.state === "more") {
                    ctx.emit("loadmore");
                }
            },
        };
    },
});
</script>

<style scoped lang="scss">
.load-more {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;

    &.primary {
        color: var(--el-color-primary);
    }
    &.smoke {
        color: var(--el-color-white);
    }
}
</style>
