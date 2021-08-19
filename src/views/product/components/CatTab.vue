<template>
    <div class="cat-tab">
        <div class="cat-tab__children">
            筛选
            <el-button
                type="text"
                circle
                :icon="showFilter ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"
                @click="onFilterToggleClick"
            ></el-button>
        </div>
        <el-collapse-transition>
            <div v-show="showFilter">
                <part-cat-card
                    v-for="item in children"
                    :key="item.id"
                    :cat="item"
                    v-model="selectedChildCatId"
                    @click="onChildCatClick(item)"
                >
                    {{ item.name }}
                </part-cat-card>
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
            </div>
        </el-collapse-transition>
        <div class="cat-tab__meta-title">{{ partTitle }}</div>
        <el-row ref="elRow" class="cat-tab__parts" :gutter="20" @scroll="onScroll">
            <el-col v-for="part in parts" :key="part.id" :span="12" style="max-height: 180px">
                <part-card :part="part"> </part-card>
            </el-col>
            <load-more :state="loadState" @loadmore="onScroll" />
        </el-row>
    </div>
</template>

<script lang="ts">
import {
    MetaBrand,
    MetaColor,
    MetaMaterial,
    Part,
    PartCategoryMeta,
    ProductCategory,
} from "@/api/interface/provider.interface";
import { computed, defineComponent, nextTick, onMounted, PropType, ref, watch } from "vue";
import apiProvider from "@/api/provider";
import PartCard from "./PartCard.vue";
import MaterialItem from "./MaterialItem.vue";
import ColorItem from "./ColorItem.vue";
import PartCatCard from "./PartCatCard.vue";
import LoadMore from "@/components/LoadMore.vue";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import { ElRow } from "element-plus";

export default defineComponent({
    name: "CatTab",
    components: {
        PartCard,
        MaterialItem,
        ColorItem,
        PartCatCard,
        LoadMore,
    },
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        cat: {
            type: Object as PropType<ProductCategory>,
            default: () => ({}),
        },
    },
    setup(props) {
        const loadState = ref<LOAD_STATE>("");
        let page = 1;
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
            const el = elRow.value?.$el as HTMLElement;
            pageScroll = new PageScroll(el, requestApi, loadState, parts);
            pageScroll.requestPage();
        });
        function requestPartCatMeta() {
            const catId = selectedChildCatId.value || props.cat.id;
            if (catId === undefined) {
                return;
            }
            apiProvider.requestPartCatMeta(catId).then((res) => {
                if (res.ok) {
                    catMeta.value = res.data;

                    nextTick(() => {
                        pageScroll?.reload();
                    });
                }
            });
        }

        watch(
            () => props.active,
            (active) => {
                if (active) {
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
        return {
            loadState,
            elRow,
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
            onChildCatClick(c: ProductCategory) {
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
                    pageScroll?.reloadCurrentPage();
                }, 200);
            },
            onScroll,
        };
    },
});
</script>

<style scoped lang="scss">
.cat-tab {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    &__children {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 22px;
        font-weight: bold;
    }
    &__meta-title {
        margin-top: 10px;
        font-size: 16px;
        font-weight: bold;
        color: var(--el-color-black);
    }
    &__parts {
        // flex: 1;
        overflow-y: auto;
    }
}
</style>
