<template>
    <div class="load-more" :class="type" v-loading="state === 'loading'" @click="onClick">
        <el-empty v-if="state === 'empty'"></el-empty>
        <divider-h v-else class="load-more__state"> {{ stateText }} </divider-h>
        <!-- <el-divider v-else-if="state === 'nomore'"> {{ stateText }} </el-divider>
        <span v-else>
            {{ stateText }}
        </span> -->
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import DividerH from "./DividerH.vue";

export default defineComponent({
    name: "LoadMore",
    components: {
        DividerH,
    },
    props: {
        state: {
            type: String as PropType<LOAD_STATE>,
            default: "",
        },
        type: {
            type: String as PropType<"primary" | "smoke">,
            default: "primary",
        },
        scroll: {
            type: Object as PropType<PageScroll<any> | undefined>,
            default: () => undefined,
        },
        textNoMore: {
            type: String,
            default: "我是有底线的",
        },
    },
    emits: ["loadmore"],
    setup(props, ctx) {
        const stateText = computed(() => {
            switch (props.state) {
                case "loading":
                    return "加载中...";
                case "nomore":
                    return props.textNoMore;
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
                    props.scroll && props.scroll.requestPageIfNeed();
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
    min-height: 40px;

    &__state {
        white-space: nowrap;
        :deep(.el-divider__text) {
            background-color: var(--el-color-bg);
        }
    }

    &.primary {
        color: var(--el-color-primary);
    }
    &.smoke {
        color: var(--el-color-white);
    }
}
</style>
