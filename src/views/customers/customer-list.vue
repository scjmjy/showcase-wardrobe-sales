<template>
    <div class="customer-list">
        <app-header class="customer-list__header" type="dark" customer :back="menu ? '返回' : ''" />
        <customer-menu v-if="menu" ref="refMenu" class="customer-list__menu" @select="onCustomerSelect" />
        <div ref="refSchemeList" class="customer-list__schemes">
            <div v-for="(schemes, index) of schemesList" :key="index" style="padding: 10px 0px">
                <div v-if="customerId" class="customer-list__info">
                    <strong class="customer-list__info-label">方案创建时间：</strong>
                    <span class="customer-list__info-value">{{ schemes.date }}</span>
                    <el-button v-if="showServeBtn && index === 0" size="small" type="dark" round @click="serve"
                        >为此客户服务</el-button
                    >
                </div>
                <el-row :gutter="20">
                    <el-col
                        v-if="!showServeBtn && customerId && index === 0"
                        :span="colSpan"
                        style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                    >
                        <new-scheme-card @new="newScheme" />
                    </el-col>
                    <el-col
                        v-for="(s, index) in schemes.schemes"
                        :key="index"
                        :span="colSpan"
                        style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                    >
                        <scheme-card :offer="!showServeBtn" :scheme="s" @detail="gotoDetail" />
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import apiProvider from "@/api/provider";
import CustomerMenu from "./components/CustomerMenu.vue";
import AppHeader from "@/views/home/components/AppHeader.vue";
import { Scheme } from "@/api/interface/provider.interface";
import SchemeCard from "./components/SchemeCard.vue";
import NewSchemeCard from "./components/NewSchemeCard.vue";
import { useStore } from "vuex";

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
    },
    setup(props) {
        const router = useRouter();
        const store = useStore();
        const schemesList = reactive([] as SortedSchemes[]);
        const customerId = ref("");
        const showServeBtn = computed(() => store.state.currentCustomer.customerId.toString() !== customerId.value);
        const refMenu = ref<InstanceType<typeof CustomerMenu>>();
        const refSchemeList = ref<HTMLDivElement>();

        function onCustomerSelect(cid: string) {
            customerId.value = cid;
            apiProvider.requestSchemes(cid).then((res) => {
                if (res.ok) {
                    const schemeList = res.data || [];
                    schemeList.sort((a, b) => {
                        return new Date(b.ptime).getTime() - new Date(a.ptime).getTime();
                    });
                    const sortedSchemesList: SortedSchemes[] = [];
                    let sortedSchemes: SortedSchemes | undefined = undefined;
                    for (const scheme of schemeList) {
                        const date = new Date(scheme.ptime).toLocaleDateString();
                        if (!sortedSchemes || sortedSchemes.date !== date) {
                            sortedSchemes = {
                                date: date,
                                schemes: [scheme],
                            };
                            sortedSchemesList.push(sortedSchemes);
                        } else {
                            sortedSchemes.schemes.push(scheme);
                        }
                    }
                    schemesList.splice(0, schemesList.length, ...sortedSchemesList);
                    refSchemeList.value?.scrollTo({ top: 0, behavior: "smooth" });
                }
            });
        }

        if (!props.menu) {
            customerId.value = store.state.currentCustomer.customerId;
            onCustomerSelect(customerId.value);
        }
        return {
            refMenu,
            refSchemeList,
            schemesList,
            customerId,
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
                store.commit("SET-PAGE-CHANNEL", {
                    key: "productDetailData",
                    value: scheme,
                });
                router.push({
                    path: "/product-detail",
                });
            },
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
        overflow-y: auto;
        padding: 10px 20px;
        background-color: var(--el-color-bg);
    }
    &__info {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        &-label {
            font-size: 26px;
            color: #172021;
            font-weight: bold;
        }
        &-value {
            font-size: 26px;
            color: #172021;
            margin-right: 35px;
        }
    }
}
</style>
