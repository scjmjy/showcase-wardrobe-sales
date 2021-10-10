<template>
    <div class="attachment-item">
        <el-image class="attachment-item__img" :src="url" fit="contain"></el-image>
        <div class="attachment-item__info">
            <div class="attachment-item__name">{{ name }}</div>
            <div class="attachment-item__count">
                <span>
                    <span>数量：</span>
                    <span class="attachment-item__count-num">{{ count }}</span>
                    <span>个</span>
                </span>
                <i
                    class="attachment-item__count-trigger u-trigger el-icon-arrow-right"
                    :class="{ 'u-trigger-ani': triggered }"
                    @click="toggleTrigger"
                ></i>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, PropType, ref } from "vue";
import { ElMessage } from "element-plus";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AttachmentItem",
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
        const triggered = ref(false);
        return {
            triggered,
            unitPrice: computed(() => {
                const unitPrice = +props.price / +props.count;
                return unitPrice;
            }),
            toggleTrigger() {
                triggered.value = !triggered.value;
                ElMessage.warning("TODO 修改附件");
            },
        };
    },
});
</script>

<style scoped lang="scss">
.attachment-item {
    display: flex;
    align-items: center;
    white-space: pre-wrap;
    &__img {
        width: 44px;
        height: 44px;
        padding: 3px;
        border: 1px solid #d8d8d8;
        border-radius: 5px;
    }
    &__info {
        margin-left: 18px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    &__name {
        font-size: 18px;
        font-weight: bold;
        color: var(--el-text-color-secondary);
    }
    &__count {
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        &-num,
        :deep(.el-input__inner) {
            font-size: 22px;
            font-weight: bold;
        }
        &-trigger {
            cursor: pointer;
            border-radius: 50%;
            padding: 5px;
            background-color: var(--el-text-color-secondary);
            color: white;
            font-weight: bolder;
        }
    }

    &:not(:first-of-type) {
        margin-top: 10px;
    }
}
</style>
