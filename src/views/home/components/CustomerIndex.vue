<template>
    <!-- <div class="customer-index">
        <div class="customer-index__tip">
            正在为 <span class="customer-index__tip-name"> {{ customer.customerName }}</span> 服务

            <el-button class="customer-index__tip-finish" type="primary" @click="stopServing">结束服务</el-button>
        </div>
        <br />
        <scheme-list></scheme-list>
    </div> -->
    <customer-list :menu="false" />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
// import { useRouter } from "vue-router";
// import { useStore } from "vuex";
// import SchemeList from "./SchemeList.vue";
import CustomerList from "@/views/customers/customer-list.vue";

export default defineComponent({
    name: "CustomIndex",
    components: {
        CustomerList,
    },
    // setup() {
    //     const store = useStore();
    //     const router = useRouter();

    //     return {
    //         customer: computed(() => store.state.currentCustomer),
    //         stopServing() {
    //             router.push("/");
    //             store.commit("SWITCH-CUSTOMER", undefined);
    //         },
    //     };
    // },
});
</script>

<style scoped lang="scss">
// .customer-index {
//     &__tip {
//         &-name {
//             color: red;
//         }
//         &-finish {
//             float: right;
//         }
//     }
// }
</style>
