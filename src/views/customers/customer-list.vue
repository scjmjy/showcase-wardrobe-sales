<template>
    <div class="customer-list">
        <app-header class="customer-list__header" type="dark" customer :back="menu ? '返回' : ''" />
        <customer-menu v-if="menu" ref="refMenu" class="customer-list__menu" @select="onCustomerSelect" />
        <div ref="refSchemeList" class="customer-list__schemes" v-loading="loadingSchemeList">
            <div class="customer-list__info">
                <strong class="customer-list__info-label">{{ customerName }}</strong>
                <el-button v-if="showServeBtn" size="small" type="dark" round @click="serve">为此客户服务</el-button>
                <el-button v-else size="small" type="primary" round @click="newServe">开始新服务</el-button>
            </div>
            <div v-if="services.length === 0" class="customer-list__empty">
                <!-- <new-scheme-card @new="newScheme" /> -->
                <el-empty></el-empty>
            </div>
            <div v-else class="customer-list__list">
                <el-collapse v-model="openedServices" @change="handleOpenedChange" @scroll="onScroll">
                    <el-collapse-item :name="svc.no" v-for="svc of services" :key="svc.id">
                        <template #title>
                            <span class="service__no">服务单号：{{ svc.no }}</span>
                            <span class="service__time">创建时间：{{ svc.ctime }}</span>
                        </template>
                        <scheme-list
                            :svcId="svc.id"
                            :menu="menu"
                            :offer="!showServeBtn"
                            @new-scheme="newScheme(svc)"
                            @detail="gotoDetail(svc, $event)"
                        ></scheme-list>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, nextTick, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElRow } from "element-plus";
import { StateType } from "@/store";
import apiProvider from "@/api/provider";
import { Service, Scheme } from "@/api/interface/provider.interface";
import AppHeader from "@/views/home/components/AppHeader.vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
// import LoadMore from "@/components/LoadMore.vue";
// import NewSchemeCard from "./components/NewSchemeCard.vue";
import CustomerMenu from "./components/CustomerMenu.vue";
import SchemeList from "./components/SchemeList.vue";

// interface SortedSchemes {
//     date: string;
//     schemes: Scheme[];
// }

export default defineComponent({
    name: "CustomerList",
    props: {
        menu: {
            type: Boolean,
            default: true,
        },
    },
    components: {
        CustomerMenu,
        AppHeader,
        SchemeList,
        // NewSchemeCard,
        // SchemeCard,
        // LoadMore,
    },
    setup(props) {
        const router = useRouter();
        const store = useStore<StateType>();
        const openedServices = ref<string[]>();
        // const schemeList = ref([] as Scheme[]);
        const services = ref<Service[]>([]);
        const customerId = ref("");
        const loadingSchemeList = ref(false);
        const showServeBtn = computed(
            () => store.state.currentCustomer.customerId.toString() !== customerId.value.toString(),
        );
        const refMenu = ref<InstanceType<typeof CustomerMenu>>();
        const refSchemeList = ref<HTMLDivElement>();

        const elScroll = ref<InstanceType<typeof ElRow>>();
        const loadState = ref<LOAD_STATE>("");
        const pageScroll = new PageScroll(undefined, requestApi, loadState, services, {
            onDataFinish: () => {
                setTimeout(() => {
                    loadingSchemeList.value = false;
                    if (services.value.length && !openedServices.value) {
                        openedServices.value = [services.value[0].no];
                    }
                }, 200);
            },
        });
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestServices(customerId.value, page, pageSize);
        }
        function onScroll(e?: Event) {
            pageScroll.onScroll();
        }

        function onCustomerSelect(cid: string) {
            customerId.value = cid;
            loadingSchemeList.value = true;
            openedServices.value = undefined;
            pageScroll.reload(300);
        }
        onMounted(() => {
            const el = elScroll.value?.$el as HTMLElement;
            pageScroll.el = el;
            if (!props.menu) {
                customerId.value = store.state.currentCustomer.customerId;
                onCustomerSelect(customerId.value);
            }
        });
        let myPath = "";
        const route = useRoute();
        watch(
            () => route.path,
            async (path) => {
                if (!myPath) {
                    myPath = path;
                } else if (myPath === path) {
                    // do updates
                    setTimeout(() => {
                        if (store.state.dirty.customerList) {
                            refMenu.value?.resetLoadstate();
                            store.commit("SET-DIRTY-CUSTOMER", false);
                            console.log("[PageScroll reload ] customerList");
                        }
                        if (store.state.dirty.schemeList.has(customerId.value)) {
                            pageScroll.reload();
                            store.commit("SET-DIRTY-SCHEME", { cid: customerId.value, dirty: false });
                            console.log("[PageScroll reload ] schemeList");
                        }
                    }, 500);
                }
            },
            {
                immediate: true,
            },
        );

        return {
            openedServices,
            handleOpenedChange(_services: string[]) {},
            loadingSchemeList,
            loadState,
            elScroll,
            refMenu,
            refSchemeList,
            services,
            // schemeList,
            customerId,
            customerName: computed(() => {
                const customer = refMenu.value?.getFullCustomer(customerId.value);
                return customer ? customer.name : "";
            }),
            showServeBtn,
            onBackClick() {
                router.back();
            },
            onCustomerSelect,
            serve() {
                const customer = refMenu.value?.getFullCustomer(customerId.value);
                if (customer) {
                    store.commit("SWITCH-CUSTOMER", {
                        cid: customer.cid,
                        customerName: customer.name,
                        phoneNumber: customer.phone,
                    });
                }
            },
            newServe() {
                router.push({
                    path: "/select-product",
                });
            },
            newScheme(svc?: Service) {
                router.push({
                    path: "/select-product",
                    query: {
                        svc: svc ? svc.id : 0,
                    },
                });
            },
            gotoDetail(svc: Service, scheme: Scheme) {
                scheme.cid = customerId.value;
                store.commit("SET-PAGE-CHANNEL", {
                    key: "productDetailData",
                    value: scheme,
                });
                router.push({
                    path: "/product-detail",
                    query: {
                        svc: svc ? svc.id : 0,
                    },
                });
            },
            onScroll,
            pageScroll,
        };
    },
});
</script>

<style scoped lang="scss">
$paddingX: 20px;
.customer-list {
    display: flex;
    position: relative;
    height: 100%;
    padding-top: 70px;
    overflow: hidden;
    &__menu {
        width: 233px;
        overflow-y: auto;
    }
    &__schemes {
        flex: 1;
        overflow-y: hidden;
        padding: 10px $paddingX;
        background-color: var(--el-color-bg);
        display: flex;
        flex-direction: column;
    }
    &__info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        &-label {
            font-size: 26px;
            color: #172021;
            font-weight: bold;
            margin-right: 20px;
        }
        &-value {
            font-size: 26px;
            color: #172021;
            margin-right: 35px;
        }
    }
    &__empty {
        text-align: center;
        margin-top: 10%;
    }
    &__list {
        // flex: 1;
        overflow-y: auto;
        margin: 0 -#{$paddingX};
        :deep(.el-collapse-item__header) {
            padding: 0 $paddingX;
            // background-color: unset;
        }
        :deep(.el-collapse-item__wrap) {
            padding: 0 $paddingX;
            background-color: unset;
        }
    }
}
.service {
    &__no {
        font-weight: bold;
        font-size: 22px;
    }
    &__time {
        margin-left: 20px;
    }
}
</style>
