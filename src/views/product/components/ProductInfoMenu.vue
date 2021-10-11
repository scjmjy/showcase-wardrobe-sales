<template>
    <div class="product-info-menu">
        <template v-if="!collapse">
            <div class="product-info-menu__text">
                <div class="product-info-menu__text-title">
                    <div v-if="!isNew">{{ titles.ownerName }}</div>
                    <div>{{ titles.productName }}</div>
                </div>
                <div class="product-info-menu__text-item">
                    <span class="text-label">尺寸：</span>
                    <span class="text-value">{{ sizeText }}</span>
                </div>
                <div class="product-info-menu__text-item">
                    <span class="text-label">单价：</span>
                    <span class="text-value">{{ unitPrice }}</span>
                </div>
                <span class="product-info-menu__text-description">
                    {{ description }}
                </span>
            </div>
            <!-- <div v-if="!isNew && offerPrice" class="product-info-menu__offer">
                <span class="product-info-menu__offer-symbol"> ￥ </span>
                <span class="product-info-menu__offer-offer">{{ offerPrice.integer }}</span>
                <span class="product-info-menu__offer-symbol">.{{ offerPrice.decimal }} </span>
            </div> -->
            <div class="product-info-menu__action">
                <el-button
                    v-if="isNew"
                    type="primary"
                    :loading="creatingScheme"
                    round
                    size="small"
                    @click="$emit('newScheme')"
                    >开始定制</el-button
                >
                <el-button
                    v-if="isSelf"
                    type="primary"
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
                <el-button v-if="isSelf && !offerPrice" type="success" round size="small" @click="$emit('offer')"
                    >报价</el-button
                >
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
import { computed, defineComponent, PropType } from "vue";
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
    },
    setup(props) {
        return {
            offerPrice: computed(() => {
                const p = props.product;
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
            sizeText: computed(() => {
                const p = props.product;
                if (!p) {
                    return undefined;
                }
                return `${p.height} × ${p.depth} × ${p.width} (m)`;
            }),
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
                return "-";
            }),
        };
    },
});
</script>

<style lang="scss" scoped>
.product-info-menu {
    transition: right 0.3s ease;

    &__text {
        width: 100%;
        &-title {
            font-size: 22px;
            font-weight: 800;
            color: var(--el-color-black);
            margin-bottom: 13px;
        }
        .text-label,
        .text-value {
            color: #6f6f6fff;
            font-size: 16px;
        }
        .text-label {
            font-weight: 800;
        }
        &-item {
            padding: 11px 0;
            border-top: 1px solid var(--el-color-info);
            &:last-of-type {
                border-bottom: 1px solid var(--el-color-info);
            }
        }
        &-description {
            display: block;
            margin-top: 22px;
            padding: 11px;
            min-height: 116px;
            color: #5c5c5cff;
            font-size: 18px;
            background-color: #f4f4f4ff;
        }
    }

    &__offer {
        margin-top: 15px;
        font-size: 32px;
        font-weight: bold;
        color: black;
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

    &__action {
        margin-top: 42px;
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

// @media (min-width: 1150px) {
//     .product-info-menu {
//         width: $infoWidthMedium;
//         &.collapse {
//             right: -230px;
//         }
//     }
// }

// @media (min-width: 1366px) {
//     .product-info-menu {
//         width: $infoWidthLarge;
//         &.collapse {
//             right: -280px;
//         }
//     }
// }
</style>
