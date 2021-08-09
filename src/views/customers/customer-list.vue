<template>
    <div class="customer-list">
        <app-header class="customer-list__header" type="dark" customer back="返回" />
        <customer-menu v-if="menu" ref="refMenu" class="customer-list__menu" @select="onCustomerSelect" />
        <div class="customer-list__schemes">
            <div v-if="customerId" class="customer-list__info">
                <strong class="customer-list__info-label">方案创建时间：</strong>
                <span class="customer-list__info-value">2021-07-30 18:59</span>
                <el-button v-if="showServeBtn" size="small" type="dark" round @click="serve">为此客户服务</el-button>
            </div>
            <el-row :gutter="20">
                <el-col
                    v-for="(s, index) in schemes"
                    :key="index"
                    :span="colSpan"
                    style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                >
                    <scheme-card :cover="s.cover" :name="s.name" @detail="gotoDetail(s)" />
                </el-col>
                <el-col
                    v-if="!showServeBtn && customerId"
                    :span="colSpan"
                    style="text-align: center; padding-top: 10px; padding-bottom: 10px"
                >
                    <new-scheme-card @click="newScheme" />
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import apiProvider from "@/api/provider";
import CustomerMenu from "./components/CustomerMenu.vue";
import AppHeader from "../home/components/AppHeader.vue";
import { Scheme } from "@/api/interface/provider.interface";
import SchemeCard from "./components/SchemeCard.vue";
import NewSchemeCard from "./components/NewSchemeCard.vue";
import { useStore } from "vuex";

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
        const schemes = reactive([] as Scheme[]);
        const customerId = ref("");
        const showServeBtn = computed(() => store.state.currentCustomer.customerId !== customerId.value);
        const refMenu = ref<InstanceType<typeof CustomerMenu>>();

        function onCustomerSelect(cid: string) {
            customerId.value = cid;
            apiProvider.requestSchemes(cid).then((res) => {
                if (res.ok) {
                    schemes.splice(0, schemes.length, ...(res.data || []));
                }
            });
        }

        if (!props.menu) {
            customerId.value = store.state.currentCustomer.customerId;
            onCustomerSelect(customerId.value);
        }
        return {
            refMenu,
            schemes,
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
                router.push({
                    path: "/product-detail",
                    query: {
                        schemeId: scheme.id,
                    },
                });
            },
        };
    },
});
</script>

<style scoped lang="scss">
@import "~@/assets/scss/element-variables.scss";
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
        padding: 20px;
        background-color: $--color-bg;
    }
    &__info {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
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
