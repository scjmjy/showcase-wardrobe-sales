<template>
    <el-dialog
        custom-class="offer-dlg"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        title="报价详情"
        width="50%"
        v-bind="$attrs"
        @opened="doOffer"
    >
        <div v-if="offerInfo.otype === 'part'" class="offer-dlg__list">
            <offer-item
                v-for="(item, index) of itemList"
                :key="index"
                :url="item.pic"
                :name="item.pname"
                :price="item.price"
                :count="item.count"
            ></offer-item>
        </div>
        <div v-else class="offer-dlg__area">
            <div>单价：{{ offerInfo.areaUnitPrice }} 元/㎡</div>
            <div>投影面积：{{ offerInfo.area }} ㎡</div>
            <div>税率：{{ offerInfo.taxrate }}</div>
        </div>
        <div class="offer-dlg__price">
            <span class="offer-dlg__price-label">合计：</span>
            <span class="offer-dlg__price-symbol"> ￥ </span>
            <span class="offer-dlg__price-offer">{{ offerPrice.integer }}</span>
            <span class="offer-dlg__price-symbol">.{{ offerPrice.decimal }} </span>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { SchemeOffer } from "@/api/interface/provider.interface";
import { computed, defineComponent, reactive, ref } from "vue";
import { splitPrice } from "@/utils/currency";
import apiProvider from "@/api/provider";
import OfferItem from "./OfferItem.vue";

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
            type: [Number, String],
            default: "",
        },
    },
    setup(props) {
        const schemeOffer = ref<SchemeOffer>();
        return {
            // dlgTitle: computed(() => `${props.customerName}，您的${props.schemeName}报价`),
            schemeOffer,
            itemList: computed(() => (schemeOffer.value ? schemeOffer.value.details : [])),
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
            offerInfo: computed(() => {
                if (!schemeOffer.value) {
                    return {
                        otype: "part",
                    };
                } else {
                    const { otype, price, area, taxreate } = schemeOffer.value;
                    return {
                        otype: otype === 1 ? "part" : "area",
                        area: area,
                        areaUnitPrice: price,
                        taxreate: taxreate,
                    };
                }
            }),
            doOffer() {
                return apiProvider.requestSchemeOffer(props.schemeId).then((res) => {
                    if (res.ok && res.data) {
                        schemeOffer.value = res.data;
                    }
                });
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
        div {
            font-weight: bold;
            font-size: x-large;
            &:first-of-type {
                margin-bottom: 20px;
            }
        }
    }
    &__price {
        margin: 30px 30px 0px 0px;
        padding-top: 10px;
        border-top: 1px solid var(--el-color-info);
        text-align: right;
        font-weight: bold;
        &-label {
            font-size: 26px;
        }
        &-symbol {
            color: #bb4050;
            font-size: 19px;
        }
        &-offer {
            color: #bb4050;
            font-size: 41px;
        }
    }
}
</style>
