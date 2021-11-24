<template>
    <div class="discount-popup">
        <div class="discount-popup__overlay"></div>
        <div class="discount-popup__content">
            <div class="discount-popup__content-header">
                <span class="discount-popup__content-title">折扣选择</span>
                <el-button
                    class="discount-popup__content-trigger iconfont icon-down"
                    type="warning"
                    circle
                    size="small"
                    @click="toggleTrigger"
                ></el-button>
            </div>
            <el-select
                class="button-shadow"
                v-model="currentDiscount"
                :popper-append-to-body="false"
                @change="onDiscountChange"
            >
                <el-option
                    v-for="(opt, index) of discounts"
                    :key="index"
                    :label="opt.label"
                    :value="opt.value"
                ></el-option>
                <template #prefix> 当前折扣： </template>
            </el-select>
        </div>
    </div>
</template>

<script lang="ts">
import { NoDiscountItem } from "@/api/interface/provider.interface";
import { StateType } from "@/store";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    name: "DiscountPopup",
    components: {},
    props: {
        discountKey: {
            type: Number,
            default: 0,
        },
        discountId: {
            type: Number,
            default: NoDiscountItem.value, // TODO: backend sql column id 1 for no discount
        },
    },
    setup(props, ctx) {
        const store = useStore<StateType>();
        const discounts = computed(() => store.state.globalCfg?.discounts || []);
        store.dispatch("updateDiscounts");
        const currentDiscount = ref(props.discountId || NoDiscountItem.value);
        return {
            discounts,
            currentDiscount,
            toggleTrigger() {
                ctx.emit("hide", currentDiscount.value);
            },
            onDiscountChange(val: number) {
                ctx.emit("change", val);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.discount-popup {
    z-index: 1000;
    position: absolute;
    left: 0px;
    top: 0px;
    bottom: 0px;
    width: 100%;
    padding-top: 80%;
    &__overlay {
        z-index: -1;
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }
    &__content {
        z-index: 2;
        position: relative;
        width: 100%;
        height: 100%;
        background-color: white;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        overflow: hidden;
        padding: 20px;

        &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            margin-bottom: 30px;
        }

        &-title {
            font-size: x-large;
        }

        :deep(.el-select) {
            .el-input__inner {
                padding-left: 110px !important;
            }
        }
    }
}
</style>
