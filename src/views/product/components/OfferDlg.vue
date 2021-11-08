<template>
    <el-dialog
        custom-class="offer-dlg"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        title="报价详情"
        width="530px"
        v-bind="$attrs"
        @opened="doOffer"
    >
        <div class="offer-dlg__list">
            <offer-item v-for="(item, index) of itemList" :key="index" :item="item"></offer-item>
        </div>
        <div class="offer-dlg__price">
            <div :class="{ 'is-disabled': discountPrice }">
                <span class="offer-dlg__price-label">合计：</span>
                <div class="offer-dlg__price-value">
                    <span class="offer-dlg__price-symbol"> ￥ </span>
                    <span class="offer-dlg__price-offer">{{ offerPrice.integer }}</span>
                    <span class="offer-dlg__price-symbol">.{{ offerPrice.decimal }} </span>
                </div>
            </div>
            <div v-if="discountPrice">
                <span class="offer-dlg__price-label">折扣价格：</span>
                <div class="offer-dlg__price-value">
                    <span class="offer-dlg__price-symbol"> ￥ </span>
                    <span class="offer-dlg__price-offer">{{ discountPrice.integer }}</span>
                    <span class="offer-dlg__price-symbol">.{{ discountPrice.decimal }} </span>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { SchemeOffer } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { splitPrice } from "@/utils/currency";
import apiProvider from "@/api/provider";
import { Scheme } from "@/lib/scheme";
import OfferItem from "./OfferItem.vue";
import { Size3D } from "@/api/interface/common.interface";
import { makePartCompositions } from "../helpers";

export default defineComponent({
    name: "OfferDlg",
    components: {
        OfferItem,
    },
    props: {
        customerName: {
            type: String,
            default: "",
        },
        schemeName: {
            type: String,
            default: "",
        },
        schemeId: {
            type: Number,
            default: 0,
        },
        scheme: {
            type: Object as PropType<Scheme>,
            required: true,
        },
        size: {
            type: Object as PropType<Size3D>,
            required: true,
        },
    },
    setup(props) {
        const discount = ref(1);
        const schemeOffer = ref<SchemeOffer>();
        return {
            discount,
            schemeOffer,
            itemList: computed(() => {
                if (!schemeOffer.value) return [];
                const items = new Array(...schemeOffer.value.details);
                return items.sort((a, b) => b.type - a.type);
            }),
            offerPrice: computed(() => {
                if (!schemeOffer.value) {
                    return {
                        integer: "",
                        decimal: "",
                    };
                } else {
                    return splitPrice(+schemeOffer.value.offer);
                }
            }),
            discountPrice: computed(() => {
                if (!schemeOffer.value || discount.value == 1) {
                    return undefined;
                } else {
                    const price = +schemeOffer.value.offer * discount.value;
                    return splitPrice(price);
                }
            }),
            async doOffer() {
                const partCounts = props.scheme.getPartCounts();
                const compositions = makePartCompositions(partCounts, props.size);
                const resDiscount = await apiProvider.requestSchemeDiscount(props.schemeId);
                if (resDiscount.ok) {
                    discount.value = resDiscount.data || 1;
                }
                const resOffer = await apiProvider.requestSchemeOffer(props.schemeId, compositions);
                if (resOffer.ok && resOffer.data) {
                    schemeOffer.value = resOffer.data;
                }
            },
        };
    },
});
</script>

<style lang="scss">
.offer-dlg {
    min-width: 650px;
    &__list {
        height: 450px;
        overflow-y: auto;
    }
    &__area {
        &-item {
            display: flex;
            justify-content: space-between;
            font-size: 26px;
            padding-bottom: 7px;
            strong {
                font-size: 1.2em;
                margin-right: 5px;
            }
            &:not(:last-of-type) {
                border-bottom: 1px solid var(--el-color-info);
                margin-bottom: 20px;
            }
        }
    }
    &__price {
        margin-top: 30px;
        padding-top: 10px;
        padding-right: 30px;
        border-top: 1px solid var(--el-color-info);
        text-align: right;
        font-weight: bold;
        &-label {
            font-size: 26px;
        }
        &-value {
            color: var(--el-color-danger);
            display: inline-block;
            .is-disabled & {
                color: var(--el-text-color-secondary);
                position: relative;
                &::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 50%;
                    height: 3px;
                    background-color: var(--el-color-danger);
                }
            }
        }
        &-symbol {
            font-size: 19px;
        }
        &-offer {
            font-size: 41px;
        }
    }
}
</style>
