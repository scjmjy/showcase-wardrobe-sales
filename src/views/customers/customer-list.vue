<template>
    <div class="customer-list">
        <app-header class="customer-list__header" type="dark" :back="menu ? '返回' : ''" />
        <customer-menu v-if="menu" ref="refMenu" class="customer-list__menu" @select="onCustomerSelect" />
        <div ref="refSchemeList" class="customer-list__schemes" v-loading="loadingSchemeList">
            <!-- <div class="customer-list__info">
                <strong class="customer-list__info-label">{{ customerName }}</strong>
                <el-button v-if="showServeBtn" size="small" type="danger" round @click="serve">为此客户服务</el-button>
            </div> -->
            <div v-if="services.length === 0" class="customer-list__empty">
                <el-empty description="暂无设计"></el-empty>
            </div>
            <!-- use v-show because of PageScroll -->
            <div v-show="services.length !== 0" ref="elScroll" class="customer-list__list" @scroll="onScroll">
                <el-collapse v-model="openedServices" @change="handleOpenedChange">
                    <el-collapse-item :name="svc.no" v-for="svc of services" :key="svc.id">
                        <template #title>
                            <div class="service" :class="{ 'is-in-service': isInService(svc) }">
                                <span class="service__no u-line-1">
                                    设计号：<span>{{ svc.no }}</span>
                                </span>
                                <span v-if="isInService(svc)" class="service__serving">正在设计中</span>
                                <el-button
                                    v-else-if="!showServeBtn"
                                    class="service__serveBtn"
                                    type="primary"
                                    size="mini"
                                    round
                                    @click.stop="continueThisService(svc)"
                                >
                                    继续此设计
                                </el-button>
                                <span class="service__time u-line-1">
                                    创建时间：<span>{{ svc.ctime }}</span>
                                </span>
                            </div>
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
                <load-more :state="loadState" />
            </div>
        </div>

        <el-tooltip class="item" effect="dark" content="开始新设计" placement="left">
            <el-button
                class="customer-list__add"
                type="primary"
                circle
                icon="iconfont icon-scheme-new"
                @click="newServe"
            ></el-button>
        </el-tooltip>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, nextTick, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { StateType } from "@/store";
import apiProvider from "@/api/provider";
import { Service, Scheme } from "@/api/interface/provider.interface";
import AppHeader from "@/views/home/components/AppHeader.vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import CustomerMenu from "./components/CustomerMenu.vue";
import SchemeList from "./components/SchemeList.vue";

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
        LoadMore,
    },
    setup(props) {
        const router = useRouter();
        const store = useStore<StateType>();
        const openedServices = ref<string[]>();
        const services = ref<Service[]>([]);
        const customerId = ref("");
        const loadingSchemeList = ref(false);
        const showServeBtn = ref(false);
        // const showServeBtn = computed(
        //     () => store.state.currentCustomer.customerId.toString() !== customerId.value.toString(),
        // );
        function isInService(svc: Service) {
            const { currentSvcId } = store.state.currentCustomer;
            return svc.id == currentSvcId;
        }
        const refMenu = ref<InstanceType<typeof CustomerMenu>>();
        const refSchemeList = ref<HTMLDivElement>();

        const elScroll = ref<HTMLDivElement>();
        const loadState = ref<LOAD_STATE>("");
        const pageScroll = new PageScroll(undefined, requestApi, loadState, services, {
            beforeDataHandler(result) {
                for (const item of result) {
                    item.ctime = item.ctime.substr(0, 16);
                }
                return result;
            },
            async afterDataHandler() {
                // 初始化 pageScroll.el
                if (!pageScroll.el) {
                    await nextTick();
                    const el = elScroll.value as HTMLElement;
                    pageScroll.el = el;
                }
            },
            onDataFinish: () => {
                setTimeout(() => {
                    loadingSchemeList.value = false;
                    if (services.value.length && !openedServices.value) {
                        const { currentSvcId } = store.state.currentCustomer;
                        const serving = services.value.find((s) => s.id === currentSvcId);
                        openedServices.value = serving ? [serving.no] : [services.value[0].no];
                    }
                }, 200);
            },
        });
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestServices(customerId.value, page, pageSize);
        }
        function onScroll(_e?: Event) {
            pageScroll.onScroll();
        }

        function onCustomerSelect(cid: string) {
            customerId.value = cid;
            loadingSchemeList.value = true;
            openedServices.value = undefined;
            pageScroll.reload(300);
        }
        onMounted(() => {
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
                            openedServices.value = undefined;
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
            isInService,
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
                        currentSvcId: services.value[0]?.id,
                    });
                }
            },
            newServe() {
                router.push({
                    path: "/select-product",
                });
            },
            newScheme(svc?: Service) {
                let query = {};
                if (svc) {
                    store.commit("SET-CUSTOMER-CURRENT-SVCID", svc.id);
                    query = { svc: svc.id };
                }
                router.push({
                    path: "/select-product",
                    query,
                });
            },
            gotoDetail(svc: Service, scheme: Scheme) {
                const { currentSvcId } = store.state.currentCustomer;
                scheme.cid = customerId.value;
                store.commit("SET-PAGE-CHANNEL", {
                    key: "productDetailData",
                    value: scheme,
                });
                router.push({
                    path: "/product-detail",
                    query: {
                        svc: currentSvcId,
                    },
                });
            },
            onScroll,
            pageScroll,
            continueThisService(svc: Service) {
                store.commit("SET-CUSTOMER-CURRENT-SVCID", svc.id);
            },
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
        // justify-content: space-between;
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
        // margin: 0 -#{$paddingX};
        :deep(.el-collapse-item:not(:last-of-type)) {
            margin-bottom: 10px;
        }
        :deep(.el-collapse-item__header) {
            padding: 0 $paddingX;
            border-radius: 6px;
            background-color: #dbdbdb;
            height: 63px;
        }
        :deep(.el-collapse-item__header.is-active) {
            border-bottom-left-radius: 0px;
            border-bottom-right-radius: 0px;
            background-color: #e0dacfff;
        }
        :deep(.el-collapse-item__wrap) {
            padding: 0 $paddingX;
            box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
        }
        :deep(.el-collapse-item__arrow) {
            font-weight: bold;
            font-size: 22px;
        }
    }
    &__add {
        position: absolute;
        right: 50px;
        bottom: 30px;
        padding: 20px !important;
        font-size: 50px;
        :deep(i) {
            color: white !important;
        }
    }
}
.service {
    // display: flex;
    // justify-content: space-between;
    // align-items: center;
    padding-left: 10px;
    flex: 1;
    margin-right: 30px;
    &__no,
    &__time {
        vertical-align: middle;
        font-weight: bold;
        font-size: 17px;
        span {
            font-weight: 400;
        }
    }
    &.is-in-service {
        .service__no {
            position: relative;
            color: var(--el-color-danger);
            &::before {
                font-family: "element-icons" !important;
                content: "\e797";
                position: absolute;
                left: -23px;
            }
        }
    }
    &__time {
        color: #7c7c7cff;
    }
    &__serveBtn {
        margin-left: 40px;
        padding: 0 20px;
        min-height: unset;
        height: 30px;
    }
    &__serving {
        display: inline-block;
        margin-left: 40px;
        padding: 5px 20px;
        vertical-align: middle;
        border-radius: 20px;
        line-height: normal;
        color: white;
        font-size: 14px;
        background-color: var(--el-color-danger);
    }
    &__time {
        float: right;
    }
}
@media (min-width: 1200px) {
    .service {
        &__no,
        &__time {
            font-size: 22px;
        }
    }
}
</style>
