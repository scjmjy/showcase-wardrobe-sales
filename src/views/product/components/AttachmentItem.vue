<template>
    <div class="attachment-item" :class="{ column: column }">
        <el-image class="attachment-item__img" :src="item.pic" fit="contain"></el-image>
        <div class="attachment-item__info">
            <div class="attachment-item__name">{{ item.pname }}</div>
            <div class="attachment-item__count">
                <span>
                    <span>数量：</span>
                    <span class="attachment-item__count-num">{{ item.count }}</span>
                    <span>个</span>
                </span>
                <i
                    v-if="!column"
                    class="attachment-item__count-trigger u-trigger iconfont icon-down"
                    :class="{ 'u-trigger--180': triggered }"
                    @click="toggleTrigger"
                ></i>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { ElMessage } from "element-plus";
import { ManifestPart } from "@/api/interface/provider.interface";

export default defineComponent({
    name: "AttachmentItem",
    props: {
        item: {
            type: Object as PropType<ManifestPart>,
            required: true,
        },
        selectedItem: {
            type: Object as PropType<ManifestPart | undefined>,
            default: undefined,
        },
        column: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["select"],
    setup(props, ctx) {
        return {
            triggered: computed(() => props.selectedItem === props.item),
            toggleTrigger() {
                ctx.emit("select", props.item);
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
    background-color: var(--el-color-info);
    border-radius: 6px;
    padding: 10px;
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
        color: #196bffff;
    }
    &__count {
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        &-num,
        :deep(.el-input__inner) {
            // font-size: 22px;
            font-weight: bold;
        }
        &-trigger {
            cursor: pointer;
            border-radius: 50%;
            padding: 5px;
            background-color: #196bffff;
            color: white;
            font-weight: bolder;
        }
    }

    &:not(:first-of-type) {
        margin-top: 10px;
    }
    &.column {
        flex-direction: column;
        width: 100%;
        .attachment-item__img {
            width: 100%;
            height: auto;
        }
        .attachment-item__info {
            margin-top: 10px;
            width: 100%;
            margin-left: unset;
        }
    }
}
</style>
