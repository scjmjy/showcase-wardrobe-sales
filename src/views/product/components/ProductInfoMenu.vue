<template>
    <div class="product-info-menu" :class="{ collapse: collapse }">
        <template v-if="!collapse">
            <div class="product-info-menu__name">{{ titles.title + titles.subTitle }}</div>
            <div v-if="!isNew && offer" class="product-info-menu__offer">
                <span class="product-info-menu__offer-symbol"> ￥ </span>
                <span class="product-info-menu__offer-offer">{{ offerPrice.integer }}</span>
                <span class="product-info-menu__offer-symbol">.{{ offerPrice.decimal }} </span>
            </div>
            <div class="product-info-menu__action">
                <el-button type="primary" round v-if="isNew" :loading="creatingScheme" @click="$emit('newScheme')"
                    >开始定制</el-button
                >
                <el-button
                    type="primary"
                    round
                    v-if="isSelf"
                    :loading="prepareContinue"
                    @click="$emit('continueScheme')"
                    >继续定制</el-button
                >
                <el-button
                    type="primary"
                    round
                    v-if="isSelf || isOther"
                    :loading="creatingScheme"
                    @click="$emit('copyScheme')"
                    >由此方案定制</el-button
                >
                <el-button v-if="isSelf && !offer" type="success" round @click="$emit('offer')">报价</el-button>
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
import { computed, defineComponent } from "vue";
import { splitPrice } from "@/utils/currency";

export default defineComponent({
    name: "ProductInfoMenu",
    props: {
        offer: {
            type: [String, Number],
            default: 0,
        },
        titles: {
            type: Object,
            default: () => ({}),
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
                if (!props.offer) {
                    return {
                        integer: "",
                        decimal: "",
                    };
                } else {
                    return splitPrice(+props.offer);
                }
            }),
        };
    },
});
</script>

<style lang="scss" scoped>
$infoWidthSmall: 258px;
$infoWidthMedium: 308px;
$infoWidthLarge: 358px;
.product-info-menu {
    width: $infoWidthSmall;

    transition: right 0.3s ease;
    &.collapse {
        right: -180px;
    }
    &__name,
    &__offer {
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
    &__name {
        white-space: pre-wrap;
    }
    &__offer {
        margin-top: 15px;
    }

    &__action {
        margin-top: 42px;
        text-align: center;
        :deep(.el-button) {
            display: block;
            width: 220px;
            margin-left: 0 !important;
            margin-bottom: 40px;
        }
    }
}

@media (min-width: 1150px) {
    .product-info-menu {
        width: $infoWidthMedium;
        &.collapse {
            right: -230px;
        }
    }
}

@media (min-width: 1366px) {
    .product-info-menu {
        width: $infoWidthLarge;
        &.collapse {
            right: -280px;
        }
    }
}
</style>
