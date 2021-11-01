<template>
    <div class="manifest-item">
        <el-image class="manifest-item__img" :src="item.pic" fit="contain"></el-image>
        <div class="manifest-item__info">
            <div class="manifest-item__name">{{ item.pname }}</div>
            <div class="manifest-item__count">
                <span>{{ item.area ? "面积：" : "数量：" }}</span>
                <span class="manifest-item__count-num">{{ item.area || item.count }}</span>
                <span>{{ item.area ? "㎡" : "个" }}</span>
            </div>
            <!-- <div v-else class="manifest-item__count">
                <span>数量：</span>
                <el-input-number
                    size="mini"
                    :min="0"
                    :model-value="item.count"
                    @update:modelValue="handleChange"
                ></el-input-number>
            </div> -->
        </div>
    </div>
</template>

<script lang="ts">
import { ManifestPart } from "@/api/interface/provider.interface";
import { computed, inject, PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "ManifestItem",
    props: {
        item: {
            type: Object as PropType<ManifestPart>,
            required: true,
        },
    },
    emits: ["update:count"],
    setup(props, ctx) {
        const updateSchemeMetalCount = inject<any>("updateSchemeMetalCount");
        return {
            handleChange(val: number) {
                ctx.emit("update:count", val);
                updateSchemeMetalCount && updateSchemeMetalCount({ partId: props.item.partid, value: val });
            },
        };
    },
});
</script>

<style scoped lang="scss">
.manifest-item {
    display: flex;
    align-items: center;
    white-space: pre-wrap;

    &__img {
        width: 44px;
        height: 44px;
        padding: 3px;
        border: 1px solid #d8d8d8;
        border-radius: 5px;
        position: relative;
    }
    &__info {
        margin-left: 18px;
        flex: 1;
        // height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    &__name {
        font-size: 18px;
        font-weight: bold;
    }
    &__count {
        font-size: 16px;
        color: var(--el-text-color-primary);
        &-num,
        :deep(.el-input__inner) {
            // font-size: 22px;
            font-weight: bold;
        }
    }

    &:not(:first-of-type) {
        margin-top: 10px;
    }

    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
