<template>
    <div class="product-card-skeleton">
        <skeleton-image effect="wave" :width="450" :height="450" />
        <div class="product-card-skeleton__bottom">
            <skeleton-text effect="wave" tag="h2">Product Name Placeholder</skeleton-text>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { SkeletonText, SkeletonImage } from "skeleton-elements/vue";

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
    components: {
        SkeletonText,
        SkeletonImage,
    },
    setup(props, context) {
        return {};
    },
});
</script>

<style scoped lang="scss">
.product-card-skeleton {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__bottom {
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        padding: 20px 0px;
        background-color: rgba(128, 128, 128, 0.6);
    }
}
</style>
