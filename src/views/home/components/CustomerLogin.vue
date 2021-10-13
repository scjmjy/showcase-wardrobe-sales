<template>
    <div class="customer-login">
        <app-header-simple back="" />
        <login-bg></login-bg>
        <div class="customer-login-form-wrapper">
            <div class="customer-login-left"></div>
            <div class="customer-login-form">
                <div class="customer-login-form__title">新客户接待</div>
                <el-input
                    v-model="formData.customerName"
                    class="customer-login-form__input"
                    prefix-icon="iconfont icon-username-2"
                    placeholder="请输入客户名称"
                >
                    <template #suffix>
                        <i class="el-input__icon iconfont icon-btn icon-random-2" @click="onRandomClick"></i>

                        <!-- <el-button icon="iconfont icon-random" circle></el-button> -->
                    </template>
                </el-input>
                <el-input
                    v-model="formData.phoneNumber"
                    class="customer-login-form__input"
                    :class="{ 'input-invalid': invalidPhone }"
                    auto-complete="off"
                    prefix-icon="iconfont icon-phone-3"
                    placeholder="请输入客户手机号码（选填）"
                    @input="onPhoneNumberInput"
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
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { formatPlain } from "@/utils/date";
import apiProvider from "@/api/provider";
import LoginBg from "@/views/login/LoginBg.vue";
import AppHeaderSimple from "./AppHeaderSimple.vue";
import { isPhoneNumber } from "@/utils/validate";

export default defineComponent({
    name: "CustomerLogin",
    components: {
        LoginBg,
        AppHeaderSimple,
    },
    setup() {
        const formData = reactive({
            customerName: "",
            phoneNumber: "",
            gender: "female",
            cid: "",
        });
        const loginLoading = ref(false);
        const invalidPhone = ref(false);
        const isLoginDisabled = computed(() => !formData.customerName);

        const store = useStore();
        const router = useRouter();

        const startService = () => {
            const { phoneNumber } = formData;
            if (phoneNumber && !isPhoneNumber(phoneNumber)) {
                ElMessage.warning("请输入正确的手机号码");
                invalidPhone.value = true;
                return;
            }
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
            invalidPhone,
            startService,
            onRandomClick,
            onPhoneNumberInput() {
                invalidPhone.value = false;
            },
        };
    },
});
</script>

<style lang="scss" scoped>
.customer-login {
    position: relative;
    padding-top: 80px;
    width: 100%;
    height: 100%;
    background-image: url(~@/assets/img/bg-login.png);
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &-form-wrapper {
        display: flex;
        z-index: 100;
    }
    &-left {
        width: 500px;
        height: 600px;
        background-image: url(~@/assets/img/bg-login-left-2.jpg);
        // background-size: 100% 100%;
        background-size: cover;
    }
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
            :deep(.el-radio__inner) {
                width: 28px;
                height: 28px;
            }
            :deep(.el-radio__inner::after) {
                width: 8px;
                height: 8px;
            }
        }
        &__btn {
            margin-top: 50px;
            display: block;
            width: 100%;
            font-size: 26px;
        }
    }
}
@media (max-width: 1200px) {
    .customer-login {
        &-left {
            width: 400px;
            height: 500px;
        }

        &-form {
            width: 558px;

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
