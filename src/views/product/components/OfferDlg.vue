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
            <div class="offer-dlg__price-item" :class="{ 'is-disabled': discountPrice }">
                <div class="offer-dlg__price-label">{{ summaryText }}</div>
                <div class="offer-dlg__price-value">
                    <span class="offer-dlg__price-symbol"> ￥ </span>
                    <span class="offer-dlg__price-offer">{{ offerPrice.integer }}</span>
                    <span class="offer-dlg__price-decimal">.{{ offerPrice.decimal }} </span>
                </div>
            </div>
            <div v-if="discountPrice" class="offer-dlg__price-item">
                <div class="offer-dlg__price-label">折扣价：</div>
                <div class="offer-dlg__price-value">
                    <span class="offer-dlg__price-symbol"> ￥ </span>
                    <span class="offer-dlg__price-offer">{{ discountPrice.integer }}</span>
                    <span class="offer-dlg__price-decimal" :data-discount="`(${discount.label})`"
                        >.{{ discountPrice.decimal }}
                    </span>
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
import { LabelValue, Size3D } from "@/api/interface/common.interface";
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
    },
    setup(props) {
        const discount = ref<LabelValue>({
            label: "无折扣",
            value: 1,
        });
        const schemeOffer = ref<SchemeOffer>();
        const offerPrice = computed(() => {
            if (!schemeOffer.value) {
                return {
                    integer: "",
                    decimal: "",
                };
            } else {
                return splitPrice(+schemeOffer.value.offer);
            }
        });
        const discountPrice = computed(() => {
            if (!schemeOffer.value || schemeOffer.value.offer === schemeOffer.value.total) {
                return undefined;
            } else {
                const price = +schemeOffer.value.total;
                return splitPrice(price);
            }
        });
        const summaryText = computed(() => {
            return discountPrice.value ? "原价：" : "合计：";
        });
        return {
            discount,
            schemeOffer,
            itemList: computed(() => {
                if (!schemeOffer.value) return [];
                const items = new Array(...schemeOffer.value.details);
                return items.sort((a, b) => b.type - a.type);
            }),
            offerPrice,
            discountPrice,
            summaryText,
            async doOffer() {
                const partCounts = props.scheme.getPartCounts();
                const compositions = makePartCompositions(partCounts);
                const resDiscount = await apiProvider.requestSchemeDiscount(props.schemeId);
                if (resDiscount.ok && resDiscount.data) {
                    discount.value = resDiscount.data;
                }
                const resOffer = await apiProvider.requestSchemeOffer(
                    props.schemeId,
                    +discount.value.value,
                    compositions,
                );
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
    &__price {
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid var(--el-color-info);
        font-weight: bold;
        // display: flex;
        // align-items: flex-end;
        &-label {
            display: inline-block;
            font-size: 26px;
            width: 60%;
            text-align: right;
        }
        &-value {
            display: inline-block;
            color: var(--el-color-danger);
            display: inline-block;
            font-size: 40px;
            .is-disabled & {
                color: var(--el-text-color-secondary);
                position: relative;
                font-size: 25px;
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
            font-size: 0.5em;
        }
        &-offer {
            font-size: 1em;
        }
        &-decimal {
            font-size: 0.5em;
            &[data-discount] {
                position: relative;
                &::after {
                    position: absolute;
                    content: attr(data-discount);
                    bottom: 3px;
                    color: var(--el-color-primary);
                    font-size: 0.8em;
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>
