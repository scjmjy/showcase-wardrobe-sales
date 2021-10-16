<template>
    <div class="cat-tab">
        <!-- <el-button v-if="up" type="text" size="small" @click="onUpClick">上一层</el-button> -->
        <div v-if="showFilterHeader" class="cat-tab__filterHeader" @click="onFilterToggleClick">
            <span>筛选</span>
            <el-button
                type="text"
                :icon="showFilter ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"
                style="padding: 0"
                @click.stop="onFilterToggleClick"
            ></el-button>
        </div>
        <el-collapse-transition>
            <div v-show="showFilter">
                <!-- <part-cat-card
                    v-for="item in children"
                    :key="item.id"
                    :cat="item"
                    v-model="selectedChildCatId"
                    @click="onChildCatClick(item)"
                >
                </part-cat-card> -->
                <template v-if="catMeta">
                    <!-- <el-divider>品牌</el-divider>
                    <div
                        v-for="brand in catMeta.brands"
                        :key="brand.id"
                        class="dev-item"
                        :class="{ 'is-selected': selectedBrandIds.includes(brand.id.toString()) }"
                        @click="onBrandClick(brand)"
                    >
                        {{ brand.name }}
                    </div> -->
                    <template v-if="catMeta.materials && catMeta.materials.length > 0">
                        <div class="cat-tab__meta-title">材质</div>
                        <el-scrollbar style="height: auto" always>
                            <div style="white-space: nowrap">
                                <material-item
                                    v-for="mat in catMeta.materials"
                                    :key="mat.id"
                                    v-model="selectedMatId"
                                    :material="mat"
                                    @change="onMatChange(mat)"
                                >
                                </material-item>
                            </div>
                        </el-scrollbar>
                    </template>
                    <template v-if="catMeta.colors && catMeta.colors.length > 0">
                        <div class="cat-tab__meta-title">颜色</div>
                        <el-scrollbar style="height: auto" always>
                            <div style="white-space: nowrap">
                                <color-item
                                    v-for="color in catMeta.colors"
                                    :key="color.id"
                                    v-model="selectedColorId"
                                    :color="color"
                                    @change="onColorChange(color)"
                                >
                                </color-item>
                            </div>
                        </el-scrollbar>
                    </template>
                </template>
            </div>
        </el-collapse-transition>
        <div class="cat-tab__parts-title">{{ partTitle }}</div>
        <div ref="refScroll" class="cat-tab__parts" @scroll="onScroll">
            <part-card v-for="part in parts" :key="part.id" :part="part" @click="onPartClick"> </part-card>
            <load-more :state="loadState" @loadmore="onScroll" />
        </div>
        <!-- <el-row ref="elRow" class="cat-tab__parts" :gutter="20" @scroll="onScroll">
            <el-col v-for="part in parts" :key="part.id" :span="12">
                <part-card :part="part" @click="onPartClick"> </part-card>
            </el-col>
            <load-more :state="loadState" @loadmore="onScroll" />
        </el-row> -->
    </div>
</template>

<script lang="ts">
import {
    MetaBrand,
    MetaColor,
    MetaMaterial,
    Part,
    PartCategory,
    PartCategoryMeta,
} from "@/api/interface/provider.interface";
import { computed, defineComponent, nextTick, onMounted, PropType, ref, watch } from "vue";
import apiProvider from "@/api/provider";
import PartCard from "./PartCard.vue";
import MaterialItem from "./MaterialItem.vue";
import ColorItem from "./ColorItem.vue";
import LoadMore from "@/components/LoadMore.vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import { ElRow } from "element-plus";

export default defineComponent({
    name: "CatTab",
    components: {
        PartCard,
        MaterialItem,
        ColorItem,
        LoadMore,
    },
    props: {
        up: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: false,
        },
        cat: {
            type: Object as PropType<PartCategory>,
            default: () => ({}),
        },
    },
    emits: ["up", "part"],
    setup(props, ctx) {
        const loading = ref(false);
        const loadState = ref<LOAD_STATE>("");
        const catMeta = ref<PartCategoryMeta>();
        const parts = ref<Part[]>([]);
        const selectedChildCatId = ref("");
        const selectedBrandIds = ref<string[]>([]);
        const selectedColorId = ref("");
        const selectedMatId = ref("");
        const showFilter = ref(true);

        const children = props.cat.children || [];
        if (children.length > 0) {
            selectedChildCatId.value = children[0].id.toString();
        }

        const elRow = ref<InstanceType<typeof ElRow>>();
        const refScroll = ref<HTMLDivElement>();
        let pageScroll: PageScroll<Part> | undefined;

        function requestApi(page: number, pageSize: number) {
            const catId = selectedChildCatId.value || props.cat.id;
            const brandId = selectedBrandIds.value[0];
            const colorId = selectedColorId.value;
            const matId = selectedMatId.value;
            return apiProvider.requestParts(catId, page, pageSize, brandId, colorId, matId);
        }
        function onScroll(e?: Event) {
            pageScroll?.onScroll();
        }
        onMounted(() => {
            // const el = elRow.value?.$el as HTMLElement;
            const el = refScroll.value as HTMLElement;
            pageScroll = new PageScroll(el, requestApi, loadState, parts);
            pageScroll.doRequestPage();
        });
        function requestPartCatMeta() {
            const catId = selectedChildCatId.value || props.cat.id;
            if (catId === undefined) {
                return;
            }
            loading.value = true;
            apiProvider
                .requestPartCatMeta(catId)
                .then((res) => {
                    if (res.ok) {
                        catMeta.value = res.data;

                        nextTick(() => {
                            pageScroll?.reload();
                        });
                    }
                })
                .finally(() => {
                    loading.value = false;
                });
        }

        watch(
            () => props.active,
            (active) => {
                if (active /*&& !catMeta.value*/) {
                    requestPartCatMeta();
                }
            },
            { immediate: true },
        );
        // watch(
        //     () => props.cat.id,
        //     () => {
        //         requestPartCatMeta();
        //     },
        //     {
        //         immediate: true,
        //     },
        // );
        const showFilterHeader = computed(
            () => catMeta.value && catMeta.value.colors && catMeta.value.materials /*&& catMeta.value.brands*/,
        );
        return {
            loading,
            showFilterHeader,
            loadState,
            elRow,
            refScroll,
            showFilter,
            selectedChildCatId,
            selectedBrandIds,
            selectedColorId,
            selectedMatId,
            catMeta,
            parts,
            children: computed(() => props.cat.children || []),
            partTitle: computed(() => {
                if (props.cat.children && props.cat.children.length > 0) {
                    const currentSelectedChild = props.cat.children.find(
                        (c) => c.id.toString() === selectedChildCatId.value,
                    );
                    return currentSelectedChild?.name;
                }
                return props.cat.name;
            }),
            onChildCatClick(c: PartCategory) {
                selectedChildCatId.value = c.id.toString();
                requestPartCatMeta();
            },
            onBrandClick(brand: MetaBrand) {
                const index = selectedBrandIds.value.findIndex((id) => id == brand.id.toString());
                if (index === -1) {
                    selectedBrandIds.value.push(brand.id.toString());
                } else {
                    selectedBrandIds.value.splice(index, 1);
                }
                pageScroll?.reload();
            },
            onColorChange(colorId: string) {
                pageScroll?.reload();
            },
            onMatChange(matId: string) {
                pageScroll?.reload();
            },
            async onFilterToggleClick() {
                showFilter.value = !showFilter.value;
                setTimeout(() => {
                    pageScroll?.requestPageIfNeed();
                }, 200);
            },
            onScroll,
            onPartClick(part: Part) {
                ctx.emit("part", part, props.cat);
            },
            onUpClick() {
                // const isBg = !!props.cat.btype;
                ctx.emit("up");
            },
        };
    },
});
</script>

<style scoped lang="scss">
.cat-tab {
    // height: 100%;
    padding-right: 3px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: var(--el-text-color-primary);
    &__filterHeader {
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        // margin-right: 5px;
        &:hover {
            background-color: var(--el-color-primary-light-4);
            border-radius: 10px;
        }
    }
    &__meta-title {
        margin-top: 10px;
        font-size: 16px;
        font-weight: bold;
    }
    &__parts-title {
        border-top: 1px solid var(--el-color-info);
        padding-top: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: bold;
    }
    &__parts {
        overflow-y: auto;
    }
}
</style>
