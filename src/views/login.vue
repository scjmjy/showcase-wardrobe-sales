<template>
    <div class="login">
        <login-bg></login-bg>
        <div class="login-form-wrapper">
            <div class="login-left"></div>
            <div class="login-form">
                <div class="login-form__title">欢迎登录</div>
                <el-input
                    v-model="username"
                    class="login-form__input"
                    prefix-icon="iconfont icon-username-2"
                    placeholder="请输入手机号码/工号"
                >
                </el-input>
                <el-input
                    v-model="passwd"
                    class="login-form__input"
                    auto-complete="off"
                    prefix-icon="iconfont icon-passwd-2"
                    placeholder="请输入密码"
                    type="password"
                    @keyup.enter="login"
                />
                <!-- <div class="u-clearfix">
                    <el-link class="login-form__forgot" type="primary" @click.prevent="onForgotClick">忘记密码</el-link>
                </div> -->
                <store-select class="login-form__store" v-model="selectedStore" />
                <button
                    class="btn-primary login-form__btn"
                    v-loading="loginLoading"
                    :disabled="isBtnDisabled"
                    @click="login"
                >
                    登录
                </button>
                <!-- <el-link class="login-form__code" type="primary" @click.prevent="onCodeClick">验证码登录</el-link> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import md5 from "md5";
import store from "@/store";
import router from "@/router";
import { AjaxResponse, LoginResult } from "@/api/interface/provider.interface";
import LoginBg from "./login/LoginBg.vue";
import StoreSelect from "./login/components/StoreSelect.vue";

export default defineComponent({
    name: "Login",
    props: {},
    components: {
        LoginBg,
        StoreSelect,
    },
    data() {
        return {
            username: "admin",
            passwd: "123456",
            // code: "",
            // codeUrl: "",
            // uuid: "",
            loginLoading: false,
            selectedStore: "",
        };
    },
    computed: {
        isBtnDisabled(): boolean {
            return this.username === "" || this.passwd === "" || !this.selectedStore;
        },
    },
    created() {
        // this.getCode();
    },
    methods: {
        onForgotClick() {
            this.$message.warning("未实现");
        },
        onCodeClick() {
            this.$message.warning("未实现");
        },
        // getCode() {
        // this.$apiProvider.getCaptchaImage().then((res: any) => {
        //     this.codeUrl = "data:image/gif;base64," + res.data.img;
        //     this.uuid = res.data.uuid;
        // });
        // },
        login() {
            if (!this.username) {
                this.$message.warning("请输入账号！");
                return;
            }
            if (!this.passwd) {
                this.$message.warning("请输入密码！");
                return;
            }
            if (!this.selectedStore) {
                this.$message.warning("请选择门店！");
                return;
            }
            // if (!this.code) {
            //     this.$message.warning("请输入验证码！");
            //     return;
            // }
            const auth = {
                username: this.username,
                passwd: md5(this.passwd),
                storeId: this.selectedStore,
                // code: this.code,
                // uuid: this.uuid,
            };
            this.loginLoading = true;
            store
                .dispatch("login", auth)
                .then((res: AjaxResponse<LoginResult>) => {
                    if (res.ok) {
                        router.push("/");
                    } else if (res.show) {
                        this.$message({
                            type: res.show,
                            message: res.msg,
                        });
                        // this.$message.error("登录失败，请输入正确的用户名、密码或验证码");
                    }
                })
                .finally(() => {
                    this.loginLoading = false;
                });
        },
    },
});
</script>

<style lang="scss" scoped>
.login {
    padding-top: 80px;
    width: 100%;
    height: 100%;
    // background-image: url(~@/assets/img/bg-login.png);
    // background-size: 100% 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    &-form-wrapper {
        display: flex;
        z-index: 100;
    }
    &-left {
        width: 530px;
        height: 645px;
        background-image: url(~@/assets/img/bg-login-left.png);
        background-size: 100% 100%;
    }
    &-form {
        width: 518px;
        // height: 661px;
        padding: 40px 40px;
        // border-radius: 30px;
        background-color: white;
        text-align: center;
        // display: flex;
        // flex-direction: column;

        &__title {
            text-align: center;
            font-size: 40px;
            font-weight: bold;
            color: #172021;
        }

        &__input {
            // width: 300px;
            // height: 40px;
            font-size: 22px;
            margin-top: 68px;
            &:first-of-type {
                margin-top: 78px;
            }
        }
        &__store {
            margin-top: 60px;
            width: 100%;
        }
        &__forgot {
            margin-top: 16px;
            float: right;
            :deep(.el-link--inner) {
                color: var(--el-color-primary-new);
            }
        }
        &__code {
            margin-top: 49px;
            :deep(.el-link--inner) {
                color: var(--el-color-primary-new);
            }
            font-size: 26px !important;
        }
        &__btn {
            margin-top: 52px;
            display: block;
            width: 100%;
            font-size: 26px;
        }
    }
}
@media (max-width: 1200px) {
    .login {
        &-left {
            width: 446px;
            height: 543px;
        }

        &-form {
            width: 418px;

            &__input {
                margin-top: 30px;
            }
            &__btn {
                margin-top: 32px;
            }
        }
    }
}
</style>
