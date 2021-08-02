<template>
    <div class="home">
        <el-tabs class="home__tabs" tab-position="bottom" stretch>
            <el-tab-pane label="首页">
                <customer-index v-if="isServing" />
                <customer-login v-else />
            </el-tab-pane>
            <el-tab-pane label="我的"><my /></el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import CustomerLogin from "./components/CustomerLogin.vue";
import CustomerIndex from "./components/CustomerIndex.vue";
import My from "./components/My.vue";

export default defineComponent({
    name: "Home",
    components: {
        CustomerLogin,
        CustomerIndex,
        My,
    },
    setup() {
        const store = useStore();
        return {
            isServing: computed(() => store.getters.isServing),
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
    ::v-deep .el-tabs {
        display: flex;
        flex-direction: column;

        &__content {
            flex: 1;

            & .el-tab-pane {
                height: 100%;
            }
        }
    }
}
</style>
