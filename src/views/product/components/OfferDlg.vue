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
        <!-- <div v-else class="offer-dlg__area">
            <div class="offer-dlg__area-item">
                <span>单价：</span>
                <span>
                    <strong>{{ offerInfo.areaUnitPrice }} </strong>元/㎡
                </span>
            </div>
            <div class="offer-dlg__area-item">
                <span>投影面积：</span>
                <span>
                    <strong>{{ offerInfo.area }} </strong>㎡
                </span>
            </div>
            <div class="offer-dlg__area-item">
                <span>税率：</span>
                <span>
                    <strong>{{ offerInfo.taxrate }} </strong>
                </span>
            </div>
        </div> -->
        <div class="offer-dlg__price" :class="{ 'is-area': offerInfo.otype === 'area' }">
            <span class="offer-dlg__price-label">合计：</span>
            <span class="offer-dlg__price-symbol"> ￥ </span>
            <span class="offer-dlg__price-offer">{{ offerPrice.integer }}</span>
            <span class="offer-dlg__price-symbol">.{{ offerPrice.decimal }} </span>
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
import { computePartArea } from "../helpers";

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
        scheme: {
            type: Object as PropType<Scheme>,
            required: true,
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
                    const { otype, price, area, taxrate } = schemeOffer.value;
                    return {
                        otype: otype === 1 ? "part" : "area",
                        area: area,
                        areaUnitPrice: price,
                        taxrate: taxrate,
                    };
                }
            }),
            doOffer(size: Size3D) {
                const compositions = props.scheme.getPartCounts();
                return apiProvider.requestSchemeOffer(props.schemeId, compositions).then((res) => {
                    if (res.ok && res.data) {
                        schemeOffer.value = res.data;
                        for (const item of schemeOffer.value.details) {
                            const found = compositions.find((p) => p.partId === item.area); // TODO item.partid
                            if (found) {
                                item.count = found.count;
                                item.area = computePartArea(found, size);
                            }
                        }
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
        &:not(.is-area) {
            margin-top: 30px;
        }
        padding-top: 10px;
        padding-right: 30px;
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
