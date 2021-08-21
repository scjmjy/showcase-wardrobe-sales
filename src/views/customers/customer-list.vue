<template>
    <div class="customer-list">
        <app-header class="customer-list__header" type="dark" customer :back="menu ? '返回' : ''" />
        <customer-menu v-if="menu" ref="refMenu" class="customer-list__menu" @select="onCustomerSelect" />
        <div ref="refSchemeList" class="customer-list__schemes" v-loading="loadingSchemeList">
            <div class="customer-list__info">
                <strong class="customer-list__info-label">{{ customerName }}</strong>
                <el-button v-if="showServeBtn" size="small" type="dark" round @click="serve">为此客户服务</el-button>
            </div>
            <el-empty v-if="showServeBtn && schemeList.length === 0" description="暂无定制方案" style="flex: 1">
            </el-empty>
            <el-row
                ref="elRow"
                class="customer-list__list"
                :gutter="20"
                :justify="schemeList.length ? '' : 'center'"
                :align="schemeList.length ? '' : 'middle'"
                @scroll="onScroll"
            >
                <el-col
                    v-if="!showServeBtn && customerId"
                    :span="colSpan"
                    style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                >
                    <new-scheme-card @new="newScheme" />
                </el-col>
                <el-col
                    v-for="(s, index) in schemeList"
                    :key="index"
                    :span="colSpan"
                    style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                >
                    <scheme-card :offer="!showServeBtn" :scheme="s" @detail="gotoDetail" />
                </el-col>
                <load-more v-if="schemeList.length" :state="loadState" />
            </el-row>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, nextTick, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import apiProvider from "@/api/provider";
import CustomerMenu from "./components/CustomerMenu.vue";
import AppHeader from "@/views/home/components/AppHeader.vue";
import { Scheme } from "@/api/interface/provider.interface";
import SchemeCard from "./components/SchemeCard.vue";
import NewSchemeCard from "./components/NewSchemeCard.vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import { ElRow } from "element-plus";

interface SortedSchemes {
    date: string;
    schemes: Scheme[];
}

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
        SchemeCard,
        NewSchemeCard,
        LoadMore,
    },
    setup(props) {
        const router = useRouter();
        const store = useStore();
        const schemeList = ref([] as Scheme[]);
        const customerId = ref("");
        const loadingSchemeList = ref(false);
        const showServeBtn = computed(
            () => store.state.currentCustomer.customerId.toString() !== customerId.value.toString(),
        );
        const refMenu = ref<InstanceType<typeof CustomerMenu>>();
        const refSchemeList = ref<HTMLDivElement>();

        const elRow = ref<InstanceType<typeof ElRow>>();
        const loadState = ref<LOAD_STATE>("");
        const pageScroll = new PageScroll(undefined, requestApi, loadState, schemeList, {
            onDataFinish: () => {
                loadingSchemeList.value = false;
            },
        });
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestSchemes(customerId.value, page, pageSize);
        }
        function onScroll(e?: Event) {
            pageScroll.onScroll();
        }

        function onCustomerSelect(cid: string) {
            customerId.value = cid;
            loadingSchemeList.value = true;
            pageScroll.reload();
        }
        onMounted(() => {
            const el = elRow.value?.$el as HTMLElement;
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
                        refMenu.value?.resetLoadstate();
                        pageScroll.reloadCurrentPage();
                    }, 500);
                }
            },
            {
                immediate: true,
            },
        );

        return {
            loadingSchemeList,
            loadState,
            elRow,
            refMenu,
            refSchemeList,
            schemeList,
            customerId,
            customerName: computed(() => {
                const customer = refMenu.value?.getFullCustomer(customerId.value);
                return customer ? customer.name : "";
            }),
            showServeBtn,
            colSpan: computed(() => (props.menu ? 8 : 6)),
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
            newScheme() {
                router.push({
                    path: "/select-product",
                });
            },
            gotoDetail(scheme: Scheme) {
                scheme.cid = customerId.value;
                store.commit("SET-PAGE-CHANNEL", {
                    key: "productDetailData",
                    value: scheme,
                });
                router.push({
                    path: "/product-detail",
                });
            },
            onScroll,
            pageScroll,
        };
    },
});
</script>

<style scoped lang="scss">
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
        padding: 10px 20px;
        background-color: var(--el-color-bg);
        display: flex;
        flex-direction: column;
    }
    &__info {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
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
    &__list {
        // flex: 1;
        overflow-y: auto;
    }
}
</style>
