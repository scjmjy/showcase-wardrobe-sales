<template>
    <div class="product-card u-clickable" @click="$emit('detail', productName)">
        <el-image class="product-card__img" :src="cover" fit="cover" @load="onImgLoad">
            <!-- <template #placeholder>
                <div class="image-slot">
                    <div class="image-slot__item-1"></div>
                    <div class="image-slot__item-2"></div>
                    <div class="image-slot__item-3"></div>
                </div>
            </template> -->
        </el-image>
        <div v-if="showBottom" class="product-card__bottom">
            <div class="product-card__name">{{ productName }}</div>
            <div class="product-card__size">{{ sizeText }}</div>
        </div>
        <!-- <el-button class="product-card__btn" type="primary" size="small" round @click="onBtnClick">开始定制</el-button> -->
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";

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
        height: {
            type: Number,
            default: 0,
        },
        depth: {
            type: Number,
            default: 0,
        },
        width: {
            type: Number,
            default: 0,
        },
    },
    emits: ["detail"],
    setup(props, context) {
        const showBottom = ref(false);
        return {
            showBottom,
            onImgLoad() {
                showBottom.value = true;
            },
            sizeText: computed(() => `高:${props.height} × 深:${props.depth} × 宽:${props.width}`),
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

    &__bottom {
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        padding: 10px 0px;
        background-color: rgba(128, 128, 128, 0.6);
    }
    &__name {
        font-size: 22px;
        color: white;
        text-shadow: 0 0 10px var(--el-color-primary);
    }
    &__size {
        font-size: 16px;
        color: white;
    }
    &__btn {
        margin: 16px auto;
        width: 135px;
    }
}

@media (max-width: 1200px) {
    .product-card {
        &__img {
            width: 350px;
            height: 350px;
        }
    }
}

// .image-slot {
//     display: inline-flex;
//     flex-direction: column;
//     justify-content: space-around;
//     width: 100%;
//     height: 100%;

//     &__item-1 {
//         width: 80%;
//         height: 20px;
//         background-color: rgba(128, 128, 128, 0.692);
//     }

//     &__item-2 {
//         width: 60%;
//         height: 20px;
//         background-color: rgba(128, 128, 128, 0.692);
//     }

//     &__item-3 {
//         width: 70%;
//         height: 20px;
//         background-color: rgba(128, 128, 128, 0.692);
//     }
// }
</style>
