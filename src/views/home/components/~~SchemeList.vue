<template>
    <div class="scheme-list__item" v-for="(s, index) of schemeList" :key="index">
        <el-image class="scheme-list__item-img" :src="s.img"></el-image>
        <div class="scheme-list__item-name">{{ s.productName }}</div>
        <div class="scheme-list__item-price" :class="{ 'has-price': Boolean(s.price) }">{{ s.price || "待报价" }}</div>

        <el-button type="primary">查看详情</el-button>
    </div>
    <div class="scheme-list__add">
        <el-button
            class="scheme-list__add-btn"
            type="text"
            size="medium"
            icon="el-icon-circle-plus-outline"
        ></el-button>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
    name: "SchemeList",
    props: {
        customerId: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const schemeList = reactive(
            new Array(5).fill(0).map((val, index) => ({
                img: "https://picsum.photos/300/300?random=" + index,
                productName: "方案" + index,
                price: index % 2 === 0 ? 10000 : undefined,
            })),
        );
        return {
            schemeList,
        };
    },
});
</script>

<style scoped lang="scss">
.scheme-list__item {
    margin-top: 5px;
    margin-bottom: 5px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    &-img {
        width: 100px;
        height: 100px;
        border-radius: 4px;
        overflow: hidden;
    }

    &-price {
        &.has-price {
            color: red;
        }
    }
}
.scheme-list__add {
    text-align: center;

    &-btn {
        font-size: 40px !important;
    }
}
</style>
