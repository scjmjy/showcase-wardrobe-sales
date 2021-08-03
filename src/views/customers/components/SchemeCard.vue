<template>
    <div class="scheme-card">
        <div class="scheme-card__imgList">
            <el-image class="scheme-card__imgList-top" :src="cover[0]" fit="cover"></el-image>
            <el-image class="scheme-card__imgList-bottom" :src="cover[1]" fit="cover"></el-image>
            <el-image class="scheme-card__imgList-bottom" :src="cover[2]" fit="cover"></el-image>
        </div>
        <div class="scheme-card__name">{{ name }}</div>
        <el-button class="scheme-card__btn" type="primary" size="small" round @click="onBtnClick">查看详情</el-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "SchemeCard",
    props: {
        cover: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            default: "",
        },
    },
    emits: ["detail"],
    setup(props, context) {
        return {
            onBtnClick() {
                context.emit("detail", props.name);
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
    background: #ffffff;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__imgList {
        width: 322px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        &-top {
            width: 100%;
            height: 280px;
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
    &__btn {
        margin: 16px auto;
        width: 135px;
    }
}
</style>
