<template>
    <div class="customer-login">
        <app-header back="" />
        <div class="customer-login-form">
            <div class="customer-login-form__title">新客户接待</div>
            <el-input
                v-model="formData.customerName"
                class="customer-login-form__input"
                prefix-icon="iconfont icon-username"
                placeholder="请输入客户名称"
            >
                <template #suffix>
                    <i class="el-input__icon iconfont icon-btn icon-random" @click="onRandomClick"></i>

                    <!-- <el-button icon="iconfont icon-random" circle></el-button> -->
                </template>
            </el-input>
            <el-input
                v-model="formData.phoneNumber"
                class="customer-login-form__input"
                auto-complete="off"
                prefix-icon="iconfont icon-passwd"
                placeholder="请输入客户手机号码（选填）"
                @keyup.enter="startService"
            />
            <el-radio-group class="customer-login-form__gender" v-model="formData.gender">
                <el-radio label="male">先生</el-radio>
                <el-radio label="female">女士</el-radio>
            </el-radio-group>
            <button
                class="customer-login-form__btn btn-primary"
                v-loading="loginLoading"
                :disabled="isLoginDisabled"
                @click="startService"
            >
                开始接待
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { formatPlain } from "@/utils/date";
import AppHeader from "./AppHeader.vue";
import apiProvider from "@/api/provider";

export default defineComponent({
    name: "CustomerLogin",
    components: {
        AppHeader,
    },
    setup() {
        const formData = reactive({
            customerName: "",
            phoneNumber: "",
            gender: "",
            cid: "",
        });
        const loginLoading = ref(false);
        const isLoginDisabled = computed(() => !formData.customerName);

        const store = useStore();
        const router = useRouter();

        const startService = () => {
            loginLoading.value = true;
            apiProvider
                .createCustomer(formData.customerName, formData.phoneNumber)
                .then((res) => {
                    if (res.ok) {
                        formData.cid = res.data || "";
                        router.push("/select-product").then(() => {
                            store.commit("SWITCH-CUSTOMER", formData);
                        });
                    } else if (res.show) {
                        ElMessage({
                            type: res.show,
                            message: res.msg,
                        });
                    }
                })
                .finally(() => {
                    loginLoading.value = false;
                });
        };
        const onRandomClick = () => {
            formData.customerName = "客户" + formatPlain(new Date());
        };
        return {
            formData,
            isLoginDisabled,
            loginLoading,
            startService,
            onRandomClick,
        };
    },
});
</script>

<style lang="scss" scoped>
.customer-login {
    position: relative;
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
            font-size: 22px;
            margin-top: 68px;
            &:first-of-type {
                margin-top: 78px;
            }
        }
        &__gender {
            margin-top: 49px;
            font-size: 26px !important;
            font-weight: bold !important;
        }
        &__btn {
            margin-top: 50px;
            display: block;
            width: 100%;
        }
    }
}
</style>
