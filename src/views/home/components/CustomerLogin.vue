<template>
    <div class="login">
        <el-form ref="form" class="login__form" :model="formData" label-width="80px">
            <el-form-item label="客户">
                <el-input v-model="formData.customerName" placeholder="请输入客户编号/姓名"></el-input>
            </el-form-item>
            <el-form-item label="电话">
                <el-input v-model="formData.phoneNumber" placeholder="选填"></el-input>
            </el-form-item>

            <el-button type="primary" :disabled="isLoginDisabled" @click="startService">开始服务</el-button>
        </el-form>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
    name: "Login",
    setup() {
        const formData = reactive({
            customerName: "",
            phoneNumber: "",
        });

        const isLoginDisabled = computed(() => !formData.customerName);

        const store = useStore();
        const router = useRouter();

        const startService = () => {
            router.push("/select-product").then((res) => {
                store.commit("SWITCH-CUSTOMER", formData);
            });
        };
        return {
            formData,
            isLoginDisabled,
            startService,
        };
    },
});
</script>

<style scoped lang="scss">
.login {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 30px;

    text-align: center;

    background-color: violet;
    &__form {
        padding: 20px 30%;
        background-color: #e8c8c880;
    }
}
</style>
