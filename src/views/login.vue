<template>
    <div class="login">
        <div class="login-form">
            <div class="login-form__title">欢迎登录</div>
            <el-input
                v-model="username"
                class="login-form__input"
                prefix-icon="iconfont icon-username"
                placeholder="请输入手机号码/工号"
            >
            </el-input>
            <el-input
                v-model="passwd"
                class="login-form__input"
                auto-complete="off"
                prefix-icon="iconfont icon-passwd"
                placeholder="请输入密码"
                type="password"
                @keyup.enter="login"
            />
            <div class="u-clearfix">
                <el-link class="login-form__forgot" type="primary" @click.prevent="onForgotClick">忘记密码</el-link>
            </div>
            <button
                class="login-form__btn btn-primary"
                v-loading="loginLoading"
                :disabled="isBtnDisabled"
                @click="login"
            >
                登录
            </button>
            <el-link class="login-form__code" type="primary" @click.prevent="onCodeClick">验证码登录</el-link>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import md5 from "md5";
import store from "@/store";
import router from "@/router";

export default defineComponent({
    name: "Login",
    props: {},
    data() {
        return {
            username: "admin",
            passwd: "123456",
            // code: "",
            // codeUrl: "",
            // uuid: "",
            loginLoading: false,
        };
    },
    computed: {
        isBtnDisabled(): boolean {
            return this.username === "" || this.passwd === "";
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
            // if (!this.code) {
            //     this.$message.warning("请输入验证码！");
            //     return;
            // }
            const auth = {
                username: this.username,
                passwd: md5(this.passwd),
                // code: this.code,
                // uuid: this.uuid,
            };
            this.loginLoading = true;
            store
                .dispatch("login", auth)
                .then((res) => {
                    console.log("LOG-INFO login: ", res);
                    router.push("/");
                })
                .catch(() => {
                    // this.getCode();
                    this.$message.error("登录失败，请输入正确的用户名、密码或验证码");
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
    width: 100%;
    height: 100%;
    background-image: url(~@/assets/img/bg-login.png);
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &-form {
        width: 618px;
        // height: 661px;
        padding: 46px 98px 95px;
        border-radius: 30px;
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
        &__forgot {
            margin-top: 16px;
            float: right;
        }
        &__code {
            margin-top: 49px;
            font-size: 26px !important;
        }
        &__btn {
            margin-top: 52px;
            display: block;
            width: 100%;
            cursor: pointer;
        }
    }
}
</style>
