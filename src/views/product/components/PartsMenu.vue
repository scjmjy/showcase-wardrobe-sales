<template>
    <div ref="refDiv" class="parts-menu">
        <div class="parts-menu__left">
            <div class="parts-menu__left-header">{{ typeText }}</div>
            <div class="parts-menu__left-items">
                <div v-for="cat in cats" :key="cat.id" class="item" @click="onCatClick(cat)">
                    {{ cat.name }}
                </div>
            </div>
        </div>
        <div class="parts-menu__right">
            <div class="parts-menu__right-header">
                <el-button class="product-detail__back" icon="el-icon-arrow-left" type="text" @click="gotoLeft"
                    >返回</el-button
                >
                <span>
                    {{ cat.name || "子分类" }}
                </span>
            </div>
            <div class="parts-menu__right-material"></div>
            <div class="parts-menu__right-color"></div>
            <div class="parts-menu__right-items"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { PartCategory, PartCategoryMeta } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType, ref } from "vue";
import apiProvider from "@/api/provider";

export default defineComponent({
    name: "PartsMenu",
    props: {
        type: {
            type: String as PropType<"in" | "out">,
            default: "out",
        },
        cat: {
            type: Object as PropType<PartCategory>,
            default: () => ({}),
        },
    },
    setup(props, ctx) {
        const refDiv = ref<HTMLDivElement>();
        const cats = ref<PartCategory[]>([]);
        const catMeta = ref<PartCategoryMeta>();
        apiProvider.requestPartCategories().then((res) => {
            if (res.ok) {
                cats.value = res.data || [];
            }
        });
        const typeText = computed(() => (props.type === "in" ? "内配" : "外配"));
        return {
            typeText,
            cats,
            catMeta,
            refDiv,
            onCatClick(cat: PartCategory) {
                apiProvider.requestPartCatMeta(cat.id).then((res) => {
                    if (res.ok) {
                        catMeta.value = res.data;
                        refDiv.value?.scrollBy({
                            behavior: "smooth",
                            left: 328,
                        });
                    }
                });
            },
            gotoLeft() {
                refDiv.value?.scrollBy({
                    behavior: "smooth",
                    left: -328,
                });
            },
        };
    },
});
</script>

<style scoped lang="scss">
.parts-menu {
    border-radius: 10px 0px 0px 10px;
    box-shadow: -5px 4px 8px rgba(0, 0, 0, 0.07);
    background-color: var(--el-color-bg);
    $width: 328px;
    width: $width;
    max-width: $width;
    overflow: hidden;

    &__left {
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        width: $width;
        height: 100%;
        &-header {
            padding: 20px 20px 10px 23px;
            color: var(--el-color-black);
            font-size: 26px;
            font-weight: bold;
            box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.16);
        }
        &-items {
            flex: 1;
            white-space: pre-wrap;

            & .item {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 50px;
                height: 50px;
                border: 1px solid red;
                margin: 10px;
            }
        }
    }
    &__right {
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        width: $width;
        height: 100%;
        &-header {
            padding: 20px 20px 10px 23px;
            color: var(--el-color-black);
            font-size: 26px;
            font-weight: bold;
            box-shadow: 5px 0px 10px 0px rgba(0, 0, 0, 0.16);
        }
        &-items {
            flex: 1;
        }
    }
}
</style>
