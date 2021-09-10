<template>
    <div class="app-header-simple">
        <div></div>
        <div class="app-header-simple__right">
            <!-- <el-image class="app-header__avatar u-circle" src="https://picsum.photos/200" circle fit="contain" /> -->
            <span class="app-header-simple__username"> {{ user.userName }} </span>
            <el-tag class="app-header-simple__job" type="primary" color="#D6CCBA">{{ user.rank }}</el-tag>
            <!-- <el-divider direction="vertical"></el-divider> -->
            <el-button class="app-header-simple__logout" type="text" @click="logout"> 退出 </el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import variables from "@/assets/scss/variables.scss";
import { useRouter } from "vue-router";

export default defineComponent({
    name: "AppHeaderSimple",
    props: {},
    setup(props) {
        const store = useStore();
        const router = useRouter();
        return {
            user: computed(() => store.state.user),
            currentCustomer: computed(() => store.state.currentCustomer),
            logout() {
                store.dispatch("logout").then(() => {
                    router.push("/login");
                });
            },
        };
    },
});
</script>

<style scoped lang="scss">
.app-header-simple {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    width: 100%;
    height: 70px;
    padding: 0px 40px 0px 20px;
    position: absolute;
    top: 0;
    left: 0;

    &__right {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__avatar {
        width: 40px;
        height: 40px;
    }
    &__username {
        margin-left: 7px;
        font-size: 22px;
        color: #222222;
    }
    &__job {
        margin-left: 11px;
        margin-right: 14px;
        color: white !important;
        border-radius: 5px;
    }
    &__logout {
        // margin-left: 14px;
        color: inherit !important;
    }
}
</style>
