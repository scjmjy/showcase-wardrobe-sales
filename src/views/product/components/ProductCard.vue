<template>
    <div class="product-card clickable">
        <el-image class="product-card__img" :src="img" fit="contain"></el-image>
        <div class="product-card__right">
            <div>{{ productName }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        img: {
            type: String,
            default: "",
        },
        productName: {
            type: String,
            default: "",
        },
    },
    setup() {
        return {};
    },
});
</script>

<style scoped lang="scss">
.product-card {
    display: inline-flex;
    justify-content: space-between;

    vertical-align: top;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    margin: 5px;
    &__img {
        width: 80px;
        height: 80px;
    }
}
</style>
