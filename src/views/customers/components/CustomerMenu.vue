<template>
    <el-menu class="customer-menu" :default-active="defaultActive" :uniqueOpened="true">
        <el-menu-item v-for="(customer, index) of customers" :key="index" :index="customer.cid">
            <span class="customer-menu__avatar">{{ getFirstWord(customer.name) }}</span>
            <div class="customer-menu__name">
                <span class="u-line-1">{{ customer.name }}</span>
                <span style="font-size: 18px">1888****888</span>
            </div>
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
                    if (store.state.currentCustomer.customerId) {
                        defaultActive.value = store.state.currentCustomer.customerId;
                    } else {
                        defaultActive.value = customers[0].cid;
                    }
                    context.emit("select", defaultActive.value);
                }
            }
        });
        return {
            customers,
            variables,
            defaultActive,
            getFullCustomer(cid: string) {
                return customers.find((c) => c.cid === cid);
            },
            getFirstWord(name: string) {
                return name ? name[0] : "";
            },
        };
    },
});
</script>

<style scoped lang="scss">
.customer-menu {
    &__avatar {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        background-color: #d8d8d8;
        color: white;
    }
    &__name {
        margin-left: 10px;
        display: inline-flex;
        flex-direction: column;
        line-height: normal;
        font-size: 24px;
        width: calc(100% - 48px);
    }
}
</style>
