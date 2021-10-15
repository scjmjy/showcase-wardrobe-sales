<template>
    <div class="product-info-menu">
        <template v-if="!collapse">
            <div class="product-info-menu__text">
                <div class="product-info-menu__text-title">
                    <div v-if="!isNew">{{ titles.ownerName }}</div>
                    <div>{{ titles.productName }}</div>
                </div>
                <div v-if="nonCustom && isNew" class="product-info-menu__text-unitPrice">
                    <span class="unit-price__symbol">￥</span>
                    <span class="unit-price__value">{{ unitPrice }}</span>
                    <span class="unit-price__unit">元/平米</span>
                </div>
                <div
                    v-else-if="!isNew && offerPrice && offerPrice.integer"
                    class="product-info-menu__text-item product-info-menu__offer"
                >
                    <span class="text-label">{{ nonCustom ? "总价" : "报价" }}：</span>
                    <span class="product-info-menu__offer-symbol"> ￥ </span>
                    <span class="product-info-menu__offer-offer">{{ offerPrice.integer }}</span>
                    <span class="product-info-menu__offer-symbol">.{{ offerPrice.decimal }} </span>
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
                        type="black"
                        :loading="creatingScheme"
                        round
                        size="small"
                        @click="$emit('order')"
                        >下单</el-button
                    >
                </template>
                <template v-else>
                    <el-button
                        v-if="isNew"
                        type="black"
                        :loading="creatingScheme"
                        round
                        size="small"
                        @click="$emit('newScheme')"
                        >开始定制</el-button
                    >
                    <el-button
                        v-if="isSelf"
                        type="black"
                        :loading="prepareContinue"
                        round
                        size="small"
                        @click="$emit('continueScheme')"
                        >继续定制</el-button
                    >
                    <el-button
                        v-if="isSelf || isOther"
                        type="primary"
                        :loading="creatingScheme"
                        round
                        size="small"
                        @click="$emit('copyScheme')"
                        >由此方案定制</el-button
                    >
                    <el-button
                        v-if="isSelf && offerPrice && !offerPrice.integer"
                        type="dark"
                        round
                        size="small"
                        @click="$emit('offer')"
                        >报价</el-button
                    >
                </template>
            </div>
        </template>
        <i
            class="collapse-trigger"
            :class="{
                'el-icon-arrow-left': collapse,
                'el-icon-arrow-right': !collapse,
            }"
            type="text"
            @click="$emit('update:collapse', !collapse)"
        ></i>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType } from "vue";
import { splitPrice } from "@/utils/currency";
import { Product, Scheme, isProduct } from "@/api/interface/provider.interface";

export default defineComponent({
    name: "ProductInfoMenu",
    props: {
        product: {
            type: Object as PropType<Product | Scheme>,
            default: () => undefined,
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
        return {
            offerPrice: computed(() => {
                const p = props.product;
                if (props.nonCustom) {
                    return {
                        integer: 3000,
                        decimal: "00",
                    };
                }
                if (!p || isProduct(p)) {
                    return undefined;
                }
                if (!p.offer) {
                    return {
                        integer: "",
                        decimal: "",
                    };
                } else {
                    return splitPrice(+p.offer);
                }
            }),
            titles: computed(() => {
                if (!props.product) {
                    return undefined;
                }
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
            // sizeText: computed(() => {
            //     const p = props.product;
            //     if (!p) {
            //         return undefined;
            //     }
            //     return `${p.height} × ${p.depth} × ${p.width} (m)`;
            // }),
            description: computed(() => {
                const p = props.product;
                if (!p) {
                    return "暂无描述";
                }
                return "-";
            }),
            unitPrice: computed(() => {
                const p = props.product;
                if (!p) {
                    return "暂无单价";
                }
                return "800";
            }),
            rate: ref(5),
            rateTexts: ["1分", "2分", "3分", "4分", "5分"],
        };
    },
});
</script>

<style lang="scss" scoped>
.product-info-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 3%;
    &__text {
        width: 100%;
        &-title {
            padding-bottom: 6px;
            border-bottom: 1px solid var(--el-color-info);
            font-size: 22px;
            font-weight: 800;
            color: var(--el-color-black);
            // text-align: center;
        }
        &-unitPrice {
            margin-top: 17px;
            color: var(--el-color-black);
            .unit-price {
                &__symbol {
                    font-weight: bold;
                    font-size: 20px;
                }
                &__value {
                    font-weight: bold;
                    font-size: 40px;
                    vertical-align: sub;
                }
                &__unit {
                    margin-left: 5px;
                    font-size: 20px;
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

    &__offer {
        margin-top: 17px;
        font-weight: bold;
        &-symbol {
            color: #bb4050;
            font-size: 15px;
        }
        &-offer {
            color: #bb4050;
            font-size: 24px;
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
            border-radius: 6px;
        }
    }
}
</style>
