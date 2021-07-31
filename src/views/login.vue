<template>
    <div class="login-page-container">
        <div class="login-form">
            <div class="left"></div>
            <div class="right">
                <div class="title">{{ title }}</div>
                <el-input v-model="username" class="login-item" prefix-icon="el-icon-user" placeholder="请输入账号" />
                <el-input
                    v-model="passwd"
                    class="login-item"
                    auto-complete="off"
                    prefix-icon="el-icon-key"
                    placeholder="请输入密码"
                    type="password"
                    :show-password="true"
                    @keyup.enter="login"
                />
                <div class="login-item u-flex u-row-around" style="margin-left: auto; margin-right: auto">
                    <el-input
                        v-model="code"
                        class="u-m-r-20"
                        auto-complete="off"
                        placeholder="验证码"
                        @keyup.enter="login"
                    >
                        <template #prefix>
                            <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
                        </template>
                    </el-input>
                    <div class="login-code">
                        <img :src="codeUrl" @click="getCode" class="login-code-img" />
                    </div>
                </div>
                <button v-loading="loginLoading" :disabled="isBtnDisabled" class="login-btn" @click="login">
                    登录
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import md5 from "md5";
// import api from "@/store/api";
import store from "@/store";
import router from "@/router";

export default defineComponent({
    name: "Login",
    props: {},
    data() {
        return {
            title: process.env.VUE_APP_TITLE,
            username: "admin",
            passwd: "1234567",
            code: "",
            codeUrl: "",
            uuid: "",
            loginLoading: false,
        };
    },
    computed: {
        isBtnDisabled(): boolean {
            return this.username === "" || this.passwd === "" || this.code == "";
        },
    },
    created() {
        this.getCode();
    },
    methods: {
        getCode() {
            // this.$apiProvider.getCaptchaImage().then((res: any) => {
            //     this.codeUrl = "data:image/gif;base64," + res.data.img;
            //     this.uuid = res.data.uuid;
            // });
        },
        login() {
            if (!this.username) {
                this.$message.warning("请输入账号！");
                return;
            }
            if (!this.passwd) {
                this.$message.warning("请输入密码！");
                return;
            }
            if (!this.code) {
                this.$message.warning("请输入验证码！");
                return;
            }
            const auth = {
                username: this.username,
                passwd: md5(this.passwd),
                code: this.code,
                uuid: this.uuid,
            };
            this.loginLoading = true;
            store
                .dispatch("login", auth)
                .then((res) => {
                    console.log("LOG-INFO login: ", res);
                    router.push("/");
                })
                .catch(() => {
                    this.getCode();
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
@import "~@/assets/scss/variables.scss";

.login-page-container {
    width: 100%;
    height: 100%;
    // background-image: url(../assets/img/login-bg.png);
    background-image: linear-gradient(#f5d276, #f1ecbb, #efbe94, #f5d276);
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .login-form {
        width: 1000px;
        height: 400px;
        vertical-align: middle;
        text-align: center;
        border-radius: 10px;
        overflow: hidden;
        .left,
        .right {
            display: inline-block;
            width: 50%;
            height: 100%;
            background-size: 100% 100%;
        }
        .left {
            background-image: url(~@/assets/img/login-form-left.png);
        }
        .right {
            background-image: url(~@/assets/img/login-form-right.png);
            float: right;
            .title {
                width: 100%;
                text-align: center;
                margin: 40px 0 40px;
                color: #5794ff;
                font-size: 1.6em;
                font-weight: 800;
            }
            .login-item {
                width: 300px;
                height: 40px;
                margin-bottom: 20px;
                font-size: 16px;

                .input-icon {
                    height: 39px;
                    width: 14px;
                    margin-left: 2px;
                }
                .login-code {
                    display: inline-block;
                    width: 33%;
                    height: 38px;
                    .login-code-img {
                        height: 38px;
                    }
                }
            }
            .login-btn {
                cursor: pointer;
                margin-top: 20px;
                width: 300px;
                height: 50px;
                background-color: rgba($color1, 0.6);
                color: white;
                border-radius: 30px;
                font-size: 18px;

                &:focus {
                    background-color: rgba($color1, 0.8);
                }
                &:hover {
                    background-color: rgba($color1, 0.8);
                }
                &:active {
                    background-color: rgba($color1, 1);
                }
                &:disabled {
                    background-color: rgba($color1, 0.4);
                }
            }
        }
    }
}
</style>

<style lang="scss">
button,
button:focus,
button:active {
    border: none;
    outline: none;
}
</style>
