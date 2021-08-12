<template>
    <div class="scheme-card">
        <div class="scheme-card__imgList">
            <el-image class="scheme-card__imgList-top" :src="scheme.cover[0]" fit="cover"></el-image>
            <!-- <el-image class="scheme-card__imgList-bottom" :src="cover[1]" fit="cover"></el-image> -->
            <!-- <el-image class="scheme-card__imgList-bottom" :src="cover[2]" fit="cover"></el-image> -->
        </div>
        <!-- <div class="scheme-card__name">{{ name }}</div> -->
        <div class="scheme-card__actions">
            <div v-if="offer" class="scheme-card__offer" :class="{ 'no-offer': noOffer }">{{ offerText }}</div>
            <el-button class="scheme-card__btn" type="primary" size="small" round @click="onBtnClick"
                >查看详情</el-button
            >
        </div>
    </div>
</template>

<script lang="ts">
import { Scheme } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
    name: "SchemeCard",
    props: {
        offer: {
            type: Boolean,
            default: false,
        },
        scheme: {
            type: Object as PropType<Scheme>,
            default: () => ({}),
        },
        // cover: {
        //     type: Array as PropType<string[]>,
        //     default: () => [],
        // },
        // name: {
        //     type: String,
        //     default: "",
        // },
    },
    emits: ["detail"],
    setup(props, context) {
        const noOffer = computed(() => !Number(props.scheme.offer));
        return {
            noOffer,
            offerText: computed(() => (noOffer.value ? "待报价" : `￥${props.scheme.offer}`)),
            onBtnClick() {
                context.emit("detail", props.scheme);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.scheme-card {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    background: #f8f8f8;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__imgList {
        padding: 22px 0;
        width: 300px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        background: white;
        &-top {
            width: 220px;
            height: 220px;
        }
        &-bottom {
            margin-top: 8px;
            display: inline-block;
            width: 156px;
            height: 104px;
        }
    }
    &__name {
        position: absolute;
        left: 14px;
        top: 240px;
        font-size: 22px;
        color: white;
    }
    &__actions {
        padding: 20px 0px;
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    &__offer {
        width: 109px;
        padding: 4px 0px;
        border: 1px solid var(--el-color-danger);
        border-radius: 40px;
        color: var(--el-color-danger);
        font-size: 18px;
        font-weight: bold;

        &.no-offer {
            border: none;
            background: #d8d8d8;
            color: var(--el-color-black);
            font-weight: normal;
        }
    }
    &__btn {
        width: 109px;
        padding: 5px 0px !important;
    }
}
</style>
