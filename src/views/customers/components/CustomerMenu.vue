<template>
    <el-menu :default-active="defaultActive" :uniqueOpened="true">
        <el-menu-item class="u-line-1" v-for="(customer, index) of customers" :key="index" :index="customer.cid">
            <i class="avatar">李</i>
            <span style="margin-left: 10px">{{ customer.name }}</span>
        </el-menu-item>
    </el-menu>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import apiProvider from "@/api/provider";
import { Customer } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/element-variables.scss";
import { useStore } from "vuex";

export default defineComponent({
    setup(props, context) {
        props;
        const store = useStore();
        const defaultActive = ref("" as number | string);
        const customers = reactive([] as Customer[]);
        apiProvider.requestCustomerList(store.state.user.userId).then((res) => {
            if (res.ok) {
                customers.push(...(res.data || []));
                if (customers.length > 0) {
                    defaultActive.value = customers[0].cid;
                    context.emit("select", defaultActive.value);
                }
            }
        });
        return {
            customers,
            variables,
            defaultActive,
        };
    },
});
</script>

<style scoped></style>
