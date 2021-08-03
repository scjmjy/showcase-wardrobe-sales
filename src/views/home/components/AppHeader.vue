<template>
    <div class="app-header" :style="headerStyle">
        <div class="app-header__left">
            <i class="app-header__icon iconfont icon-wardrobe" />
            <span class="app-header__label">弘木橱柜定制系统</span>
        </div>
        <div class="app-header__right">
            <el-image class="app-header__avatar u-circle" src="https://picsum.photos/200" circle fit="contain" />
            <span class="app-header__username"> {{ user.userName }} </span>
            <el-tag class="app-header__job" type="primary" color="#5EB6B366">店长助理</el-tag>
            <el-button class="app-header__logout" type="text"> 退出 </el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import variables from "@/assets/scss/element-variables.scss";

export default defineComponent({
    name: "AppHeader",
    props: {
        type: {
            type: String,
            default: "light", // dark
        },
    },
    setup(props) {
        const store = useStore();
        const headerStyle = computed(() => ({
            color: props.type === "light" ? variables.colorPrimary : "white",
            "background-color": props.type === "light" ? "#ffffffbd" : variables.colorPrimary,
        }));
        return {
            user: computed(() => store.state.user),
            headerStyle,
        };
    },
});
</script>

<style scoped lang="scss">
@import "~@/assets/scss/element-variables.scss";

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 70px;
    padding: 0 40px;
    position: absolute;
    top: 0;
    left: 0;

    // background-color: #ffffffbd;

    &__icon {
        font-size: 34px;
        color: inherit !important;
    }

    &__label {
        margin-left: 12px;
        // color: $--color-primary;
        font-size: 26px;
        font-weight: bold;
    }

    &__left,
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
        color: inherit !important;
    }
    &__logout {
        margin-left: 35px;
        color: inherit !important;
    }
}
</style>
