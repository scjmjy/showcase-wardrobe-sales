<template>
    <div class="part-bg-tab">
        <div class="part-bg-tab__type">背景类型</div>
        <div style="white-space: nowrap">
            <img-radio-item
                v-for="opt in bgTypeOpts"
                :key="opt.id"
                v-model="selectedBgType"
                :option="opt"
                @change="onBgTypeChange"
            >
            </img-radio-item>
        </div>
        <div class="part-bg-tab__title">{{ title }}</div>
        <div ref="refScroll" @scroll="onScroll">
            <img-card-item v-for="bg in bgItems" :key="bg.value" :option="bg" @click="onCardClick"> </img-card-item>
            <load-more :state="loadState" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { Background, BackgroundType } from "@/api/interface/provider.interface";
import ImgRadioItem, { ImgRadioItemType } from "./ImgRadioItem.vue";
import ImgCardItem, { ImgCardItemType } from "./ImgCardItem.vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import LoadMore from "@/components/LoadMore.vue";
import apiProvider from "@/api/provider";

export default defineComponent({
    name: "PartBgTab",
    props: {},
    emits: ["bg"],
    components: {
        ImgRadioItem,
        ImgCardItem,
        LoadMore,
    },
    setup(props, ctx) {
        const refScroll = ref<HTMLDivElement>();
        const bgTypeOpts = ref<ImgRadioItemType[]>([
            {
                label: "墙面",
                value: BackgroundType.WALL,
                url: process.env.BASE_URL + "/imgs/cover-wall.png",
            },
            {
                label: "地板",
                value: BackgroundType.FLOOR,
                url: process.env.BASE_URL + "/imgs/cover-floor.png",
            },
        ]);
        const selectedBgType = ref(bgTypeOpts.value[0].value);

        const bgs = ref<Background[]>([]);
        const bgItems = computed<ImgCardItemType[]>(() =>
            bgs.value.map((bg) => ({
                label: bg.name,
                value: bg.id,
                url: bg.pic,
            })),
        );

        const loadState = ref<LOAD_STATE>("");
        let pageScroll: PageScroll<Background> | undefined;
        function requestApi(page: number, pageSize: number) {
            return apiProvider.requestBackgrounds(selectedBgType.value as BackgroundType, page, pageSize);
        }
        function afterDataHandler(page: number) {}
        function onScroll(e?: Event) {
            pageScroll?.onScroll();
        }
        onMounted(() => {
            const el = refScroll.value as HTMLElement;

            pageScroll = new PageScroll(el, requestApi, loadState, bgs, { afterDataHandler });
            pageScroll.doRequestPage();
        });

        function onBgTypeChange() {
            pageScroll?.reload();
        }

        onBgTypeChange();

        return {
            loadState,
            refScroll,
            selectedBgType,
            bgTypeOpts,
            bgs,
            bgItems,
            title: computed(() => bgTypeOpts.value.find((opt) => opt.value === selectedBgType.value)?.label),
            onCardClick(bg: ImgCardItemType) {
                ctx.emit("bg", bg, selectedBgType.value);
            },
            onBgTypeChange,
            onScroll,
        };
    },
});
</script>

<style scoped lang="scss">
.part-bg-tab {
    &__type {
        margin-bottom: 10px;
        font-size: 22px;
        font-weight: bold;
        color: var(--el-color-black);
    }
    &__title {
        margin-top: 22px;
        margin-bottom: 10px;
        font-size: 22px;
        font-weight: bold;
        color: var(--el-color-black);
    }
}
</style>
