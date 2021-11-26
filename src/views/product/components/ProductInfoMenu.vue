<template>
    <div class="product-info-menu">
        <template v-if="!collapse">
            <div class="product-info-menu__wrapper" :class="{ 'is-blur': showDicountPage }">
                <div class="product-info-menu__text">
                    <div class="product-info-menu__text-title">
                        <div v-if="!isNew">{{ titles.ownerName }}</div>
                        <div>{{ titles.productName }}</div>
                    </div>
                    <div v-if="nonCustom && isNew && !discountPrice" class="product-info-menu__text-unitPrice">
                        <span class="unit-price__label">{{ priceLabel }}</span>
                        <span class="unit-price__symbol">￥</span>
                        <span class="unit-price__value">{{ unitPrice }}</span>
                        <span class="unit-price__unit">{{ unitLabel }}</span>
                    </div>
                    <div v-else class="product-info-menu__text-item product-info-menu__offer">
                        <div
                            v-if="offerPrice && offerPrice.integer"
                            class="offerPriceItem"
                            :class="{ 'is-disabled': discountPrice }"
                        >
                            <div class="offerPriceItem-label">{{ offerLabel }}</div>
                            <div class="offerPriceItem-value">
                                <span class="offerPriceItem-symbol"> ￥ </span>
                                <span class="offerPriceItem-offer">{{ offerPrice.integer }}</span>
                                <span class="offerPriceItem-decimal">.{{ offerPrice.decimal }} </span>
                            </div>
                        </div>
                        <div v-if="discountPrice" class="offerPriceItem">
                            <div class="offerPriceItem-label">折扣价：</div>
                            <div class="offerPriceItem-value">
                                <span class="offerPriceItem-symbol"> ￥ </span>
                                <span class="offerPriceItem-offer">{{ discountPrice.integer }}</span>
                                <span class="offerPriceItem-decimal" :data-discount="`(${discount.label})`"
                                    >.{{ discountPrice.decimal }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="nonCustom" class="product-info-menu__text-state" style="visibility: hidden">
                        <span class="sale-state__1">在售</span>
                        <span class="sale-state__2">（现货）</span>
                    </div>
                    <div class="product-info-menu__text-size">
                        <div class="size-item" v-for="(item, index) of sizeList" :key="index">
                            <span class="size-item__label">{{ item.label }}</span>
                            <span class="size-item__value">{{ item.value }}</span>
                        </div>
                    </div>
                    <div class="product-info-menu__text-description">
                        <div class="description__label">商品描述</div>
                        <div class="description__value">{{ description }}</div>
                    </div>
                    <el-rate
                        class="product-info-menu__text-rate"
                        v-model="rate"
                        :colors="['#FD7F23FF', '#FD7F23FF', '#FD7F23FF']"
                        :texts="rateTexts"
                        show-text
                        disabled
                        style="visibility: hidden"
                    ></el-rate>
                </div>
                <div class="product-info-menu__action">
                    <template v-if="nonCustom">
                        <el-button
                            v-if="isNew"
                            class="button-shadow"
                            type="black"
                            :loading="creatingScheme"
                            size="small"
                            @click="$emit('order', discount.value)"
                            >下单</el-button
                        >
                    </template>
                    <template v-else>
                        <el-button
                            v-if="isNew"
                            class="button-shadow"
                            type="black"
                            :loading="creatingScheme"
                            size="small"
                            @click="$emit('newScheme')"
                            >开始定制</el-button
                        >
                        <el-button
                            v-if="isSelf"
                            class="button-shadow"
                            type="black"
                            :loading="prepareContinue"
                            size="small"
                            @click="$emit('continueScheme')"
                            >继续定制</el-button
                        >
                        <el-button
                            v-if="isSelf || isOther"
                            class="button-shadow"
                            type="primary"
                            :loading="creatingScheme"
                            size="small"
                            @click="$emit('copyScheme')"
                            >由此方案定制</el-button
                        >
                    </template>
                </div>
            </div>
        </template>
        <i
            class="collapse-trigger iconfont"
            :class="{
                'icon-left': collapse,
                'icon-right': !collapse,
            }"
            type="text"
            @click="$emit('update:collapse', !collapse)"
        ></i>
        <el-button
            v-if="isNew && nonCustom"
            class="product-info-menu__discount iconfont icon-discount"
            type="text"
            @click="onDiscountBtnClick"
        ></el-button>
        <transition name="el-zoom-in-bottom">
            <discount-popup
                v-if="isNew && showDicountPage"
                :discountId="discount.value"
                :discountKey="product.id"
                @change="onDiscountChange"
                @hide="onDiscountPopupHide"
            />
        </transition>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType } from "vue";
import { useStore } from "vuex";
import { splitPrice } from "@/utils/currency";
import {
    Product,
    Scheme,
    isProduct,
    DiscountItem,
    NoDiscountItem,
    PriceType,
} from "@/api/interface/provider.interface";
import DiscountPopup from "./DiscountPopup.vue";
import apiProvider from "@/api/provider";
import { StateType } from "@/store";
import { LabelValue } from "@/api/interface/common.interface";
import { calcNcProductPrice, findDiscount, hasNoDiscount } from "../helpers";

export default defineComponent({
    name: "ProductInfoMenu",
    components: {
        DiscountPopup,
    },
    props: {
        product: {
            type: Object as PropType<Product | Scheme>,
            required: true,
        },
        collapse: {
            type: Boolean,
            default: true,
        },
        creatingScheme: {
            type: Boolean,
            default: false,
        },
        prepareContinue: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: true,
        },
        isSelf: {
            type: Boolean,
            default: false,
        },
        isOther: {
            type: Boolean,
            default: true,
        },
        nonCustom: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const newDidscount = ref<DiscountItem>(NoDiscountItem);
        const discount = computed<DiscountItem>(() => {
            const p = props.product;
            if (isProduct(p)) {
                return newDidscount.value;
            } else {
                const foundDiscount = findDiscount(p.did);
                return foundDiscount || { label: "?", value: p.did, discount: p.discount };
            }
        });
        const showDicountPage = ref(false);
        const offerPrice = computed(() => {
            const p = props.product;
            if (props.isNew && props.nonCustom) {
                const price = calcNcProductPrice(p as Product);
                return splitPrice(price);
            } else if (isProduct(p) || !p.total) {
                return {
                    integer: "",
                    decimal: "",
                };
            } else {
                return splitPrice(+p.offer);
            }
        });
        const discountPrice = computed(() => {
            const p = props.product;
            const did = discount.value.value;
            if (!hasNoDiscount(did)) {
                if (props.isNew && props.nonCustom) {
                    const price = calcNcProductPrice(p as Product, discount.value.discount);
                    return splitPrice(price);
                } else if (!isProduct(p)) {
                    return splitPrice(+p.total);
                }
            }
            return undefined;
        });
        const priceLabel = computed(() => (props.product.otype === PriceType.AREA ? "单价：" : "总价："));
        const unitLabel = computed(() => (props.product.otype === PriceType.AREA ? "元/平米" : ""));
        return {
            showDicountPage,
            discount,
            onDiscountBtnClick() {
                showDicountPage.value = true;
            },
            onDiscountPopupHide() {
                showDicountPage.value = false;
            },
            onDiscountChange(did: number) {
                newDidscount.value = findDiscount(did) || NoDiscountItem;
            },
            priceLabel,
            unitLabel,
            offerLabel: computed(() => {
                if (props.nonCustom || discountPrice.value) {
                    return "原价：";
                } else {
                    return "报价：";
                }
            }),
            offerPrice,
            discountPrice,
            titles: computed(() => {
                let productName = "";
                const p = props.product;
                if (isProduct(p)) {
                    productName = p.name;
                    return {
                        productName,
                    };
                } else {
                    productName = p.product;
                    return {
                        ownerName: p.customer + "的",
                        productName,
                    };
                }
            }),
            sizeList: computed(() => {
                const p = props.product;
                if (!p) {
                    return [];
                }
                return [
                    {
                        label: "高度：",
                        value: p.height + " m",
                    },
                    {
                        label: "深度：",
                        value: p.depth + " m",
                    },
                    {
                        label: "宽度：",
                        value: p.width + " m",
                    },
                ];
            }),
            description: computed(() => {
                return props.product.description || "暂无描述";
            }),
            unitPrice: computed(() => {
                const p = props.product;
                if (!p) {
                    return "暂无单价";
                }
                return props.product.price || "-";
            }),
            rate: ref(5),
            rateTexts: ["1分", "2分", "3分", "4分", "5分"],
        };
    },
});
</script>

<style lang="scss" scoped>
.product-info-menu {
    padding: 15px 3%;
    &__wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    &__text {
        width: 100%;
        &-title {
            padding: 10px 0;
            border-bottom: 1px solid var(--el-color-info);
            font-size: 22px;
            font-weight: 800;
            color: var(--el-color-black);
            // text-align: center;
        }
        &-unitPrice {
            margin-top: 17px;
            font-size: 20px;
            color: var(--el-color-black);
            .unit-price {
                &__label {
                    font-weight: bold;
                    font-size: 1em;
                }
                &__symbol {
                    font-weight: bold;
                    font-size: 1em;
                }
                &__value {
                    font-weight: bold;
                    font-size: 1.5em;
                }
                &__unit {
                    margin-left: 5px;
                    font-size: 1em;
                }
            }
        }
        &-state {
            margin-top: 17px;
            .sale-state {
                &__1 {
                    color: #ff7f00;
                    font-size: 22px;
                    font-weight: bold;
                }
                &__2 {
                    color: var(--el-color-black);
                    font-size: 18px;
                }
            }
        }
        &-size {
            margin-top: 17px;
            .size-item {
                font-size: 22px;
                font-weight: bold;
                &__label {
                    color: var(--el-color-black);
                }
                &__value {
                    display: inline-block;
                    margin-left: 17px;
                    width: 75px;
                    color: #7c7c7cff;
                    text-align: right;
                }
            }
        }
        &-description {
            margin-top: 33px;
            .description__label {
                font-size: 18px;
                font-weight: bold;
                color: #7c7c7c;
            }
            .description__value {
                margin-top: 6px;
                line-height: 26px;
                font-size: 14px;
                color: #909090;
                white-space: pre-wrap;
            }
        }
        &-rate {
            margin-top: 30px;
        }
        :deep(.el-rate) {
            .el-rate__text {
                font-size: 18px;
                font-weight: bold;
                color: #7c7c7c !important;
            }
        }
    }

    &__action {
        margin-top: 30px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        :deep(.el-button) {
            display: block;
            width: 100%;
            margin-left: 0 !important;
            margin-bottom: 17px;
        }
    }
    &__discount {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 30px;
    }

    &__offer {
        margin-top: 10px;
    }
}

.offerPriceItem {
    // padding-top: 10px;
    font-weight: bold;
    font-size: 22px;
    &-label {
        display: inline-block;
        font-size: 1em;
        width: 30%;
        margin-right: 5px;
        color: var(--el-color-black);
    }
    &-value {
        display: inline-block;
        color: var(--el-color-danger);
        display: inline-block;
        font-size: 1.2em;
        .is-disabled & {
            color: var(--el-text-color-secondary);
            position: relative;
            font-size: 0.8em;
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
                bottom: 0px;
                color: var(--el-color-primary);
                font-size: 0.8em;
                white-space: nowrap;
            }
        }
    }
}
</style>
