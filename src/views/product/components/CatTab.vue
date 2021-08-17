<template>
    <div>
        <div>子类 <el-button type="text" @click="showFilter = !showFilter">收起/弹出</el-button></div>
        <el-collapse-transition>
            <div v-show="showFilter">
                <div
                    v-for="item in children"
                    :key="item.id"
                    class="dev-item"
                    :class="{ 'is-selected': selectedChildCatId == item.id }"
                    @click="onChildCatClick(item)"
                >
                    {{ item.name }}
                </div>
                <template v-if="catMeta">
                    <el-divider>品牌</el-divider>
                    <div
                        v-for="brand in catMeta.brands"
                        :key="brand.id"
                        class="dev-item"
                        :class="{ 'is-selected': selectedBrandIds.includes(brand.id.toString()) }"
                        @click="onBrandClick(brand)"
                    >
                        {{ brand.name }}
                    </div>
                    <el-divider>颜色</el-divider>
                    <div
                        v-for="color in catMeta.colors"
                        :key="color.id"
                        class="dev-item"
                        :class="{ 'is-selected': selectedColorIds.includes(color.id.toString()) }"
                        @click="onColorClick(color)"
                    >
                        {{ color.name }}
                    </div>
                    <el-divider>材质</el-divider>
                    <div
                        v-for="mat in catMeta.materials"
                        :key="mat.id"
                        class="dev-item"
                        :class="{ 'is-selected': selectedMatIds.includes(mat.id.toString()) }"
                        @click="onMatClick(mat)"
                    >
                        {{ mat.name }}
                    </div>
                </template>
            </div>
        </el-collapse-transition>
        <el-divider>部件</el-divider>
        <el-row :gutter="20">
            <el-col v-for="part in parts" :key="part.id" :span="12">
                <part-card :part="part"> </part-card>
            </el-col>
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
import { computed, defineComponent, nextTick, PropType, ref, watch } from "vue";
import apiProvider from "@/api/provider";
import PartCard from "./PartCard.vue";

export default defineComponent({
    name: "CatTab",
    components: {
        PartCard,
    },
    props: {
        cat: {
            type: Object as PropType<ProductCategory>,
            default: () => ({}),
        },
    },
    setup(props) {
        let page = 1;
        const catMeta = ref<PartCategoryMeta>();
        const parts = ref<Part[]>([]);
        const selectedChildCatId = ref("");
        const selectedBrandIds = ref<string[]>([]);
        const selectedColorIds = ref<string[]>([]);
        const selectedMatIds = ref<string[]>([]);
        const showFilter = ref(true);

        const children = props.cat.children || [];

        if (children.length > 0) {
            selectedChildCatId.value = children[0].id.toString();
        }

        function requestPartCatMeta() {
            const catId = selectedChildCatId.value || props.cat.id;
            if (catId === undefined) {
                return;
            }
            apiProvider.requestPartCatMeta(catId).then((res) => {
                if (res.ok) {
                    catMeta.value = res.data;

                    nextTick(() => {
                        requestParts();
                    });
                }
            });
        }
        requestPartCatMeta();

        function requestParts() {
            const catId = selectedChildCatId.value || props.cat.id;
            const brandId = selectedBrandIds.value[0];
            const colorId = selectedColorIds.value[0];
            const matId = selectedMatIds.value[0];
            apiProvider.requestParts(catId, page, 10, brandId, colorId, matId).then((res) => {
                if (res.ok) {
                    const result = res.data || [];
                    parts.value.push(...result);
                }
            });
        }
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
            showFilter,
            selectedChildCatId,
            selectedBrandIds,
            selectedColorIds,
            selectedMatIds,
            catMeta,
            parts,
            children: computed(() => props.cat.children || []),
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
                page = 1;
                parts.value.length = 0;
                requestParts();
            },
            onColorClick(color: MetaColor) {
                const index = selectedColorIds.value.findIndex((id) => id == color.id.toString());
                if (index === -1) {
                    selectedColorIds.value.push(color.id.toString());
                } else {
                    selectedColorIds.value.splice(index, 1);
                }
                page = 1;
                parts.value.length = 0;
                requestParts();
            },
            onMatClick(mat: MetaMaterial) {
                const index = selectedMatIds.value.findIndex((id) => id == mat.id.toString());
                if (index === -1) {
                    selectedMatIds.value.push(mat.id.toString());
                } else {
                    selectedMatIds.value.splice(index, 1);
                }
                page = 1;
                parts.value.length = 0;
                requestParts();
            },
        };
    },
});
</script>

<style scoped></style>
