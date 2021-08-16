<template>
    <div class="product-card u-clickable" @click="$emit('detail', productName)">
        <el-image class="product-card__img" :src="cover" fit="cover"></el-image>
        <div class="product-card__name">{{ productName }}</div>
        <!-- <el-button class="product-card__btn" type="primary" size="small" round @click="onBtnClick">开始定制</el-button> -->
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
            // onBtnClick() {
            //     context.emit("detail", props.productName);
            // },
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
        // width: 322px;
        // height: 256px;
        width: 450px;
        height: 450px;
    }
    &__name {
        position: absolute;
        left: 14px;
        top: 400px;
        font-size: 22px;
        color: white;
        text-shadow: 0 0 10px var(--el-color-primary);
    }
    &__btn {
        margin: 16px auto;
        width: 135px;
    }
}
</style>
