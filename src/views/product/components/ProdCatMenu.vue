<template>
    <el-menu :default-active="defaultActive" :uniqueOpened="true">
        <el-menu-item v-for="(cat, index) of productCats" :key="index" :index="cat.id">
            <i class="iconfont" :class="'icon-' + cat.icon"></i>
            <span style="margin-left: 10px">{{ cat.name }}</span>
            <!-- <template #title>导航二</template> -->
        </el-menu-item>
    </el-menu>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import apiProvider from "@/api/provider";
import { ProductCategory } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/element-variables.scss";

export default defineComponent({
    setup(props, context) {
        props;
        const defaultActive = ref("" as number | string);
        const productCats = reactive([] as ProductCategory[]);
        apiProvider.requestProductCategories().then((res) => {
            if (res.ok) {
                productCats.push(...res.data);
                if (productCats.length > 0) {
                    defaultActive.value = productCats[0].id;
                    context.emit("select", defaultActive.value);
                }
            }
        });
        return {
            productCats,
            variables,
            defaultActive,
        };
    },
});
</script>

<style scoped></style>
