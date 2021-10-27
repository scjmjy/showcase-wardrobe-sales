<template>
    <div class="offer-item" v-if="item">
        <el-image class="offer-item__img" :src="item.pic" fit="contain"></el-image>
        <div class="offer-item__info">
            <div class="offer-item__name">{{ item.pname }}</div>
            <div class="offer-item__count">
                <span>{{ item.area ? "面积：" : "数量：" }}</span>
                <span class="manifest-item__count-num">{{ item.area || item.count }}</span>
                <span>{{ item.area ? "㎡" : "个" }}</span>
            </div>
            <!-- <div class="offer-item__count">
                单价：<span>{{ unitPrice }}</span
                >元，数量：<span>{{ count }}</span
                >个
            </div> -->
            <!-- <div class="offer-item__price">
                小计：<span>{{ price }}</span
                >元
            </div> -->
        </div>
    </div>
</template>

<script lang="ts">
import { PartOffer } from "@/api/interface/provider.interface";
import { computed, PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "ManifestItem",
    props: {
        item: {
            type: Object as PropType<PartOffer>,
            default: undefined,
        },
    },
    setup(props, ctx) {
        return {
            // unitPrice: computed(() => {
            //     const unitPrice = +props.price / +props.count;
            //     return unitPrice;
            // }),
        };
    },
});
</script>

<style scoped lang="scss">
.offer-item {
    display: flex;
    align-items: center;
    &__img {
        width: 100px;
        height: 100px;
        padding: 3px;
        border: 1px solid #d8d8d8;
        border-radius: 5px;
    }
    &__info {
        margin-left: 18px;
        padding-bottom: 5px;
        flex: 1;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    &__name {
        font-size: 22px;
        font-weight: bold;
    }
    &__count {
        span {
            font-size: 22px;
            font-weight: bold;
        }
    }
    &__price {
        span {
            font-size: 22px;
            font-weight: bold;
        }
    }

    &:not(:first-of-type) {
        margin-top: 60px;
    }
}
</style>
