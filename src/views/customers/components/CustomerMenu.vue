<template>
    <el-menu ref="elMenu" class="customer-menu" :default-active="defaultActive" :uniqueOpened="true" @scroll="onScroll">
        <template v-for="(customer, index) of customers" :key="index">
            <el-menu-item
                :index="customer.cid.toString()"
                :class="{ 'iconfont icon-username-2 absolute-icon': isServingCustomer(customer.cid) }"
                style="position: relative"
            >
                <!-- <span class="customer-menu__avatar">{{ getFirstWord(customer.name) }}</span> -->
                <span class="customer-menu__name u-line-1">{{ getCustomeName(customer.name) }}</span>
                <!-- <div class="customer-menu__name">
                <span class="u-line-1">{{ getCustomeName(customer.name) }}</span>
                <span style="font-size: 18px">{{ customer.phone || "" }}</span>
            </div> -->
            </el-menu-item>
        </template>
        <load-more :state="loadState" />
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
                nextTick(() => {
                    if (store.state.currentCustomer.customerId) {
                        defaultActive.value = store.state.currentCustomer.customerId.toString();
                    } else {
                        defaultActive.value = customers.value[0].cid.toString();
                    }
                    context.emit("select", defaultActive.value);
                });
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
            pageScroll.doRequestPage();
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
                if (name.length > 10) return name ? name.substring(2, 14) : "";
                else return name ? name : "";
            },
            isServingCustomer(id: number | string) {
                return id == store.state.currentCustomer.customerId;
            },
            onScroll,
            resetLoadstate() {
                const el = elMenu.value?.$el as HTMLElement;
                el.scrollTo({
                    top: lastestScrollY,
                });
                pageScroll?.reload();
            },
        };
    },
});
</script>

<style scoped lang="scss">
$MenuItemHeight: 46px;
.customer-menu {
    background-color: white;
    padding: 10px 5px;
    :deep(.el-menu) {
        background-color: white;
    }
    :deep(.el-menu-item) {
        padding-left: 30px !important;
        height: $MenuItemHeight !important;
        line-height: $MenuItemHeight !important;
        border-radius: 6px;
        background-color: white;
        color: var(--el-color-primary);
        font-weight: bold;
        margin: 5px 0;
    }
    :deep(.el-menu-item.is-active) {
        background-color: var(--el-color-primary);
        color: white;
    }
    :deep(.el-menu-item:hover) {
        background-color: var(--el-color-primary-light-5);
        color: white;
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
        color: var(--el-color-primary);
    }
    &__name {
        margin-left: 0px;
        display: inline-flex;
        flex-direction: column;
        line-height: normal;
        flex-wrap: wrap;
        font-size: 24px;
        vertical-align: baseline;
    }
    .absolute-icon::before {
        position: absolute;
        left: 2px;
        display: flex;
        align-items: center;
    }
}
</style>
