<template>
    <div class="app-header" :style="headerStyle">
        <el-button
            v-if="back"
            class="app-header__left app-header__back"
            type="text"
            icon="el-icon-arrow-left"
            round
            @click="doBack"
            >{{ back }}</el-button
        >
        <div class="app-header__middle">
            <template v-if="customer && currentCustomer.customerId">
                <i class="app-header__icon iconfont icon-customer" />
                <span class="app-header__serving"
                    >正在为 <strong>{{ currentCustomer.customerName }}</strong> 服务</span
                >
                <!-- <el-tag class="app-header__stop" type="error" color="#BB4050">结束服务</el-tag> -->
                <el-button v-if="stop" class="app-header__stop" type="danger" size="small" round @click="stopServe"
                    >结束服务</el-button
                >
            </template>
            <template v-else>
                <i v-if="titleIcon" class="app-header__icon iconfont" :class="titleIcon" />
                <span class="app-header__label">{{ title }}</span>
                <span v-if="subTitle" class="app-header__subLabel">{{ subTitle }}</span>
            </template>
        </div>
        <div class="app-header__right">
            <el-image class="app-header__avatar u-circle" src="https://picsum.photos/200" circle fit="contain" />
            <span class="app-header__username"> {{ user.userName }} </span>
            <el-tag class="app-header__job" type="primary" color="#5EB6B366">店长助理</el-tag>
            <el-divider direction="vertical"></el-divider>
            <el-button class="app-header__logout" type="text" @click="logout"> 退出 </el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import variables from "@/assets/scss/variables.scss";
import { useRouter } from "vue-router";

export default defineComponent({
    name: "AppHeader",
    props: {
        type: {
            type: String,
            default: "light", // dark
        },
        customer: {
            type: Boolean,
            default: false,
        },
        stop: {
            type: Boolean,
            default: true,
        },
        back: {
            type: String,
            default: "返回", //
        },
        icon: {
            type: String,
            default: "wardrobe",
        },
        title: {
            type: String,
            default: "弘木橱柜定制系统",
        },
        subTitle: {
            type: String,
            default: "",
        },
    },
    setup(props) {
        const store = useStore();
        const router = useRouter();
        const headerStyle = computed(() => ({
            color: props.type === "light" ? variables.colorPrimary : "white",
            "background-color": props.type === "light" ? "#ffffffbd" : variables.colorPrimary,
        }));
        return {
            user: computed(() => store.state.user),
            currentCustomer: computed(() => store.state.currentCustomer),
            headerStyle,
            titleIcon: computed(() => (props.icon ? "icon-" + props.icon : "")),
            stopServe() {
                store.commit("SWITCH-CUSTOMER", undefined);
                router.push("/");
            },
            logout() {
                store.dispatch("logout").then(() => {
                    router.push("/login");
                    // window.location.reload();
                });
            },
            doBack() {
                router.back();
            },
        };
    },
});
</script>

<style scoped lang="scss">
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 70px;
    padding: 0px 40px 0px 20px;
    position: absolute;
    top: 0;
    left: 0;

    &__left,
    &__right,
    &__middle {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__left {
        margin-right: 100px;
    }

    &__back {
        font-size: 26px;
        color: inherit !important;
        padding-left: 0px !important;
    }

    &__icon {
        font-size: 34px;
        color: inherit !important;
    }
    &__serving {
        margin-left: 12px;
        font-size: 26px;
        strong {
            font-size: 30px;
            font-weight: bold;
        }
    }
    &__stop {
        margin-left: 20px;
        width: 118px !important;
    }
    &__label {
        margin-left: 12px;
        // color: $--color-primary;
        font-size: 26px;
        font-weight: bold;
    }
    &__subLabel {
        font-size: 24px;
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
        color: inherit !important;
    }
    &__logout {
        margin-left: 14px;
        color: inherit !important;
    }
}
</style>
