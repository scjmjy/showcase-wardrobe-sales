<template>
    <el-dialog
        class="offer-dlg"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :title="dlgTitle"
        width="650px"
        v-bind="$attrs"
        @opened="onOpened"
    >
        <div class="offer-dlg__list">
            <offer-item
                v-for="(item, index) of itemList"
                :key="index"
                :url="item.pic"
                :name="item.pname"
                :price="item.price"
                :count="item.count"
            ></offer-item>
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
    setup(props, ctx) {
        const schemeOffer = ref<SchemeOffer>();
        return {
            dlgTitle: computed(() => `${props.customerName}，您的${props.schemeName}报价`),
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
            onOpened() {
                apiProvider.requestSchemeOffer(props.schemeId).then((res) => {
                    if (res.ok && res.data) {
                        schemeOffer.value = res.data;
                    }
                });
            },
        };
    },
});
</script>

<style lang="scss" scoped>
.offer-dlg {
    &__list {
        height: 450px;
        overflow-y: auto;
    }
    &__price {
        padding: 30px 30px 0px;
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
