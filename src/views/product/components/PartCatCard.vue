<template>
    <div class="part-cat-card" :class="{ active: active }">
        <el-image class="part-cat-card__img u-clickable" :src="cat.pic" fit="contain" @click="onImgClick"></el-image>
        <div class="part-cat-card__label">{{ cat.name }}</div>
    </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { PartCategory } from "@/api/interface/provider.interface";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "PartCatCard",
    props: {
        cat: {
            type: Object as PropType<PartCategory>,
            default: () => ({}),
        },
        modelValue: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue", "click"],
    setup(props, ctx) {
        return {
            active: computed(() => props.modelValue === props.cat.id.toString()),
            onImgClick() {
                ctx.emit("update:modelValue", props.cat.id.toString());
                ctx.emit("click", props.cat);
            },
        };
    },
});
</script>

<style scoped lang="scss">
@use "~@/assets/scss/business.scss" as *;
.part-cat-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: top;
    margin: $card-margin;
    width: $card-width;
    &__img {
        width: 100%;
        height: 100%;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
        border-radius: 10px;
        overflow: hidden;
        background-color: white;
    }
    &__label {
        margin-top: 10px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: var(--el-color-black);
    }

    &.active &__img {
        border: 3px solid var(--el-color-primary);
    }
}

// @media (min-width: 1150px) {
//     .part-cat-card {
//         width: 110px;
//         &__img {
//             width: 110px;
//             height: 110px;
//         }
//     }
// }

// @media (min-width: 1366px) {
//     .part-cat-card {
//         width: 140px;
//         &__img {
//             width: 140px;
//             height: 140px;
//         }
//         // &__label {
//         //     font-size: 18px;
//         // }
//     }
// }
</style>
