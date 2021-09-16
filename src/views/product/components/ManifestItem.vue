<template>
    <div class="manifest-item">
        <el-image class="manifest-item__img" :src="url" fit="contain"></el-image>
        <div class="manifest-item__info">
            <div class="manifest-item__name">{{ name }}</div>
            <div v-if="type === '3d'" class="manifest-item__count">
                数量：<span>{{ count }}</span
                >个
            </div>
            <div v-else class="manifest-item__count">
                数量：
                <el-input-number
                    size="mini"
                    :min="0"
                    :model-value="count"
                    @update:modelValue="handleChange"
                ></el-input-number>
            </div>
            <!-- <div class="manifest-item__count">
                单价：<span>{{ unitPrice }}</span
                >元，数量：<span>{{ count }}</span
                >个
            </div> -->
            <!-- <div class="manifest-item__price">
                小计：<span>{{ price }}</span
                >元
            </div> -->
        </div>
    </div>
</template>

<script lang="ts">
import { computed, inject, PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "ManifestItem",
    props: {
        name: {
            type: String,
            default: "",
        },
        url: {
            type: String,
            default: "",
        },
        count: {
            type: [String, Number],
            default: 0,
        },
        price: {
            type: [String, Number],
            default: 0,
        },
        partId: {
            type: Number,
            default: 0,
        },
        type: {
            type: String as PropType<"2d" | "3d">,
            default: "3d",
        },
    },
    emits: ["update:count", "metalCount"],
    setup(props, ctx) {
        const updateSchemeMetalCount = inject<any>("updateSchemeMetalCount");
        return {
            unitPrice: computed(() => {
                const unitPrice = +props.price / +props.count;
                return unitPrice;
            }),
            handleChange(val: number) {
                ctx.emit("update:count", val);
                // ctx.emit("metalCount", { partId: props.partId, value: val });
                updateSchemeMetalCount && updateSchemeMetalCount({ partId: props.partId, value: val });
            },
        };
    },
});
</script>

<style scoped lang="scss">
.manifest-item {
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
        span,
        :deep(.el-input__inner) {
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
