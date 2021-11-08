<template>
    <div class="discount-popup">
        <div class="discount-popup__overlay"></div>
        <div class="discount-popup__content">
            <div class="discount-popup__content-header">
                <span class="discount-popup__content-title">折扣选择</span>
                <el-button
                    class="discount-popup__content-trigger"
                    type="warning"
                    circle
                    icon="el-icon-arrow-down"
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
import { StateType } from "@/store";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import apiProvider from "@/api/provider";

export default defineComponent({
    name: "DiscountPopup",
    components: {},
    props: {
        schemeId: {
            type: Number,
            default: 0,
        },
    },
    setup(props, ctx) {
        const store = useStore<StateType>();
        const discounts = computed(() => store.state.globalCfg?.discounts || []);
        const currentDiscount = ref(1);
        apiProvider.requestSchemeDiscount(props.schemeId).then((res) => {
            if (res.ok) {
                currentDiscount.value = res.data || 1;
            }
        });
        return {
            discounts,
            currentDiscount,
            toggleTrigger() {
                ctx.emit("hide");
            },
            onDiscountChange(val: number) {
                apiProvider.updateSchemeDiscount(props.schemeId, val).then(() => {});
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
