<template>
    <div class="home" :class="{ showAdd: showAdd }">
        <el-tabs class="home__tabs" v-model="currentPane" tab-position="bottom" stretch>
            <el-tab-pane name="customer">
                <customer-index v-if="isServing" />
                <customer-login v-else />

                <template #label>
                    <tab-pane-label label="客户接待" icon="customer-3" :disabled="currentPane === 'my'" />
                </template>
            </el-tab-pane>
            <el-tab-pane name="my">
                <my />
                <template #label>
                    <tab-pane-label label="个人中心" icon="my-2" :disabled="currentPane === 'customer'" />
                </template>
            </el-tab-pane>
        </el-tabs>
        <el-button
            v-if="showAdd"
            class="home__add"
            type="primary"
            circle
            icon="iconfont icon-scheme-new"
            @click="onAddClick"
        ></el-button>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import Emitter from "@/event";
import CustomerLogin from "./components/CustomerLogin.vue";
import CustomerIndex from "./components/CustomerIndex.vue";
import My from "./components/My.vue";
import TabPaneLabel from "./components/TabPaneLabel.vue";

export default defineComponent({
    name: "Home",
    components: {
        CustomerLogin,
        CustomerIndex,
        My,
        TabPaneLabel,
    },
    setup() {
        const store = useStore();
        const currentPane = ref("customer");
        const isServing = computed(() => store.getters.isServing);
        return {
            isServing,
            currentPane,
            showAdd: computed(() => currentPane.value === "customer" && isServing.value),
            onAddClick() {
                Emitter.emit("scheme-new");
            },
        };
    },
});
</script>

<style lang="scss" scoped>
// @import "~@/assets/scss/utils.scss";

.home {
    position: relative;
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
        background-color: var(--el-color-bg);
        & .el-tab-pane {
            height: 100%;
        }
    }
    :deep(.el-tabs__item) {
        height: 100px;
        font-size: 40px;
    }
    &.showAdd {
        :deep(.el-tabs__content) {
            padding-bottom: 40px;
        }
    }

    &__add {
        position: absolute;
        left: 50%;
        bottom: 50px;
        transform: translateX(-50%);
        padding: 25px;
        font-size: 60px;
        :deep(i) {
            color: white !important;
        }
    }
}
</style>
