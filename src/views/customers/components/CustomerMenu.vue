<template>
    <el-menu ref="elMenu" class="customer-menu" :default-active="defaultActive" :uniqueOpened="true" @scroll="onScroll">
        <el-menu-item v-for="(customer, index) of customers" :key="index" :index="customer.cid.toString()">
            <span class="customer-menu__avatar">{{ getFirstWord(customer.name) }}</span>
            <div class="customer-menu__name">
                <span class="u-line-1">{{ getCustomeName(customer.name) }}</span>
                <span style="font-size: 18px">{{ customer.phone || "" }}</span>
            </div>
        </el-menu-item>
        <load-more :state="loadState" type="smoke" />
    </el-menu>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, nextTick, onMounted } from "vue";
import apiProvider from "@/api/provider";
import { Customer } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/variables.scss";
import { useStore } from "vuex";
// import { onBeforeRouteUpdate } from "vue-router";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import { StateType } from "@/store";
import { ElMenu } from "element-plus";

export default defineComponent({
    name: "CustomerMenu",
    components: {
        LoadMore,
    },
    setup(props, context) {
        const store = useStore<StateType>();
        const elMenu = ref<InstanceType<typeof ElMenu>>();
        const customers = ref<Customer[]>([]);
        const loadState = ref<LOAD_STATE>("");
        const defaultActive = ref<number | string>("");
        let lastestScrollY = 0;
        let pageScroll: PageScroll<Customer> | undefined;
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestCustomerList(store.state.user.eid, page, pageSize);
        }
        function afterDataHandler(page: number) {
            if (customers.value.length > 0 && !defaultActive.value && page === 1) {
                if (store.state.currentCustomer.customerId) {
                    defaultActive.value = store.state.currentCustomer.customerId.toString();
                } else {
                    defaultActive.value = customers.value[0].cid.toString();
                }
                context.emit("select", defaultActive.value);
            }
        }
        function onScroll(e?: Event) {
            const el = elMenu.value?.$el as HTMLElement;
            lastestScrollY = el.scrollTop;
            pageScroll?.onScroll();
        }
        onMounted(() => {
            const el = elMenu.value?.$el as HTMLElement;
            pageScroll = new PageScroll(el, requestApi, loadState, customers, { afterDataHandler });
            pageScroll.requestPage();
        });
        // onBeforeRouteUpdate(async (to, from) => {
        //     console.log("【CustomerMenu:onBeforeRouteUpdate】");

        //     if (loadState.value === "nomore") {
        //         loadState.value = "more";
        //         onScroll();
        //         console.log("【CustomerMenu:onBeforeRouteUpdate】onScroll");
        //     }
        // });

        return {
            elMenu,
            loadState,
            customers,
            variables,
            defaultActive,
            getFullCustomer(cid: string) {
                return customers.value.find((c) => c.cid.toString() === cid);
            },
            getFirstWord(name: string) {
                return name ? name[0] : "";
            },
            getCustomeName(name: string) {
                if(name.length > 10 )
                    return name ? name.substring(2,14) : "";
                else
                    return name ? name : "";
            },
            onScroll,
            resetLoadstate() {
                const el = elMenu.value?.$el as HTMLElement;
                el.scrollTo({
                    top: lastestScrollY,
                });
                // pageScroll?.reloadCurrentPage();
                pageScroll?.reload();
            },
        };
    },
});
</script>

<style scoped lang="scss">
.customer-menu {
    :deep(.el-menu-item) {
        padding-left: 30px !important;
        height: 86px !important;
        line-height: 86px !important;
        // font-weight: bold;
    }
    &__avatar {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 0px;
        height: 0px;
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
        flex-wrap: wrap;
        font-size: 24px;
        font-family: "Micorsoft YaHei";
        width: calc(100% - 48px);
    }
}
</style>
