<template>
    <el-menu ref="elMenu" class="customer-menu" :default-active="defaultActive" :uniqueOpened="true" @scroll="onScroll">
        <el-menu-item v-for="(customer, index) of customers" :key="index" :index="customer.cid.toString()">
            <span class="customer-menu__avatar">{{ getFirstWord(customer.name) }}</span>
            <div class="customer-menu__name">
                <span class="u-line-1">{{ customer.name }}</span>
                <span style="font-size: 18px">{{ customer.phone || "" }}</span>
            </div>
        </el-menu-item>
        <load-more :state="loadState" type="smoke" />
    </el-menu>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, nextTick } from "vue";
import apiProvider from "@/api/provider";
import { Customer } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/variables.scss";
import { useStore } from "vuex";
// import { onBeforeRouteUpdate } from "vue-router";
import { checkReachBottom, LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import { StateType } from "@/store";
import { ElMenu } from "element-plus";

export default defineComponent({
    name: "CustomerMenu",
    components: {
        LoadMore,
    },
    setup(props, context) {
        const loadState = ref<LOAD_STATE>("");
        let page = 1;
        const PAGE_SIZE = 10;
        let FULL_STATE: "full" | "not-full" = "full";
        let lastestScrollY = 0;
        const store = useStore<StateType>();
        const defaultActive = ref("" as number | string);
        const customers = reactive([] as Customer[]);
        function requestCustomers(emit = false) {
            loadState.value = "loading";
            apiProvider.requestCustomerList(store.state.user.eid, page, PAGE_SIZE).then((res) => {
                if (res.ok) {
                    const result = res.data || [];
                    if (result.length === 0) {
                        loadState.value = "nomore";
                        page--;
                        FULL_STATE = "full";
                    } else if (result.length < PAGE_SIZE) {
                        loadState.value = "nomore";
                        FULL_STATE = "not-full";
                    } else if (result.length === PAGE_SIZE) {
                        FULL_STATE = "full";
                        loadState.value = "more";
                    }
                    // customers.push(...result);
                    if (result.length) {
                        customers.splice((page - 1) * PAGE_SIZE, PAGE_SIZE, ...result);
                    }
                    if (customers.length > 0 && !defaultActive.value && page === 1) {
                        if (store.state.currentCustomer.customerId) {
                            defaultActive.value = store.state.currentCustomer.customerId.toString();
                        } else {
                            defaultActive.value = customers[0].cid.toString();
                        }
                        if (emit) {
                            context.emit("select", defaultActive.value);
                        }
                    }
                    nextTick(() => {
                        onScroll();
                    });
                }
            });
        }
        requestCustomers(true);

        const elMenu = ref<InstanceType<typeof ElMenu>>();
        function onScroll(e?: Event) {
            const el = elMenu.value?.$el as HTMLElement;
            lastestScrollY = el.scrollTop;
            checkReachBottom(el, () => {
                console.log("[OnReachBottom]!!!");

                if (loadState.value !== "nomore" && loadState.value !== "loading") {
                    if (FULL_STATE === "full") {
                        page++;
                    }
                    requestCustomers();
                }
            });
        }
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
                return customers.find((c) => c.cid.toString() === cid);
            },
            getFirstWord(name: string) {
                return name ? name[0] : "";
            },
            onScroll,
            resetLoadstate() {
                console.log("【CustomerMenu:resetLoadstate】");
                if (loadState.value === "nomore") {
                    loadState.value = "more";
                    // page = 1;
                    // customers.length = 0;
                    // requestCustomers();
                    const el = elMenu.value?.$el as HTMLElement;
                    el.scrollTo({
                        top: lastestScrollY,
                    });

                    onScroll();
                    console.log("【CustomerMenu:resetLoadstate】-onScroll");
                }
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
        font-weight: bold;
    }
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
