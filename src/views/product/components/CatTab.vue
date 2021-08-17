<template>
    <div>
        <div>子类</div>
        <div
            v-for="item in children"
            :key="item.id"
            class="dev-item"
            :class="{ 'is-selected': selectedChildCatId == item.id }"
            @click="onChildCatClick(item)"
        >
            {{ item.name }}
        </div>
        <el-divider>分割线</el-divider>
        <template v-if="catMeta">
            <div>品牌</div>
            <div v-for="brand in catMeta.brands" :key="brand.id" class="dev-item">
                {{ brand.name }}
            </div>
            <el-divider>分割线</el-divider>
            <div>颜色</div>
            <div v-for="color in catMeta.colors" :key="color.id" class="dev-item">
                {{ color.name }}
            </div>
            <el-divider>分割线</el-divider>
            <div>材质</div>
            <div v-for="mat in catMeta.materials" :key="mat.id" class="dev-item">
                {{ mat.name }}
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { PartCategoryMeta, ProductCategory } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import apiProvider from "@/api/provider";

export default defineComponent({
    name: "CatTab",
    props: {
        cat: {
            type: Object as PropType<ProductCategory>,
            default: () => ({}),
        },
    },
    setup(props) {
        const catMeta = ref<PartCategoryMeta>();
        const selectedChildCatId = ref("");

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
                }
            });
        }
        requestPartCatMeta();
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
            selectedChildCatId,
            catMeta,
            children: computed(() => props.cat.children || []),
            onChildCatClick(c: ProductCategory) {
                selectedChildCatId.value = c.id.toString();
                requestPartCatMeta();
            },
        };
    },
});
</script>

<style scoped></style>
