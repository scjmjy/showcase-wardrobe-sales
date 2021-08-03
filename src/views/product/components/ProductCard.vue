<template>
    <div class="product-card">
        <el-image class="product-card__img" :src="cover" fit="cover"></el-image>
        <div class="product-card__name">{{ productName }}</div>
        <el-button class="product-card__btn" type="primary" size="small" round @click="onBtnClick">开始定制</el-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        cover: {
            type: String,
            default: "",
        },
        productName: {
            type: String,
            default: "",
        },
    },
    emits: ["detail"],
    setup(props, context) {
        return {
            onBtnClick() {
                context.emit("detail", props.productName);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.product-card {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__img {
        width: 322px;
        height: 316px;
    }
    &__name {
        position: absolute;
        left: 14px;
        top: 280px;
        font-size: 22px;
        color: white;
    }
    &__btn {
        margin: 16px auto;
        width: 135px;
    }
}
</style>
