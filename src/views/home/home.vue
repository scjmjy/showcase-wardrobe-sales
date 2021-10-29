<template>
    <div class="home">
        <el-tabs class="home__tabs" v-model="currentPane" tab-position="bottom" stretch>
            <el-tab-pane name="customer">
                <customer-index />
                <!-- <customer-login v-else /> -->

                <template #label>
                    <tab-pane-label label="设计" icon="customer-3" :disabled="currentPane === 'my'" />
                </template>
            </el-tab-pane>
            <el-tab-pane name="my"
                ><my />
                <template #label>
                    <tab-pane-label label="个人中心" icon="my-2" :disabled="currentPane === 'customer'" /> </template
            ></el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import CustomerIndex from "./components/CustomerIndex.vue";
import My from "./components/My.vue";
import TabPaneLabel from "./components/TabPaneLabel.vue";
import { useRoute } from "vue-router";

export default defineComponent({
    name: "Home",
    components: {
        CustomerIndex,
        My,
        TabPaneLabel,
    },
    setup() {
        const store = useStore();
        const route = useRoute();
        const currentPane = ref(route.query.tab || "customer");
        location.href = location.href.replace(/\?.*$/, "");

        watch(
            () => route.query.tab as string,
            (tab) => {
                if (tab) {
                    currentPane.value = tab;
                    location.href = location.href.replace(/\?.*$/, "");
                }
            },
        );
        return {
            isServing: computed(() => store.getters.isServing),
            currentPane,
        };
    },
});
</script>

<style lang="scss" scoped>
// @import "~@/assets/scss/utils.scss";

.home {
    height: 100%;
    padding-bottom: 5px;

    &__tabs {
        height: 100%;
    }
    :deep(.el-tabs) {
        display: flex;
        flex-direction: column;
    }
    :deep(.el-tabs__content) {
        flex: 1;

        & .el-tab-pane {
            height: 100%;
        }
    }
    :deep(.el-tabs__header) {
        margin: 0 !important;
        & .el-tabs__item {
            height: 90px;
            font-size: 40px;
        }
        & .el-tabs__nav {
            background-color: var(--el-color-bg-dark);
            padding-top: 10px;
        }
    }
}
</style>
