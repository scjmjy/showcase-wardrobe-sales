<template>
    <el-menu class="prod-cat-menu" @select="onProdCatSelect">
        <template v-for="cat of productCats" :key="cat.id">
            <el-submenu v-if="cat.children && cat.children.length" :index="cat.id">
                <template #title>{{ cat.name }}</template>
                <menu-item :category="cat" />
            </el-submenu>
            <el-menu-item v-else :index="cat.id">
                <template #title>{{ cat.name }}</template>
            </el-menu-item>
        </template>
    </el-menu>
    <!-- <el-collapse-transition-h>
        <div v-if="opened" class="prod-cat-menu">
            <div class="prod-cat-menu__item" v-for="(cat, index) in productCats" :key="index">
                <div
                    class="prod-cat-menu__filter-style__item"
                    v-for="(item, index) in currentProdCat.filters"
                    :key="index"
                >
                    <div class="prod-cat-menu__filter-style__item-title">
                        {{ item.title }}
                        <el-button
                            class="trigger-btn u-trigger"
                            :class="{ 'u-trigger-ani': !item.closed }"
                            circle
                            type="dark"
                            icon="el-icon-arrow-right"
                            @click="item.closed = !item.closed"
                        ></el-button>
                    </div>
                    <el-collapse-transition>
                        <div v-if="!item.closed" class="prod-cat-menu__filter-style__item-styles">
                            <el-button
                                class="style-btn"
                                v-for="(style, index2) of item.styles"
                                :key="index2"
                                round
                                :type="style.selected ? 'primary' : 'info'"
                                @click="onStyleClick(item, style)"
                                >{{ style.label }}</el-button
                            >
                        </div>
                    </el-collapse-transition>
                </div>
            </div>
        </div>
    </el-collapse-transition-h> -->
    <!-- <div class="prod-cat-menu">
        <div class="prod-cat-menu__menu">
            <el-menu :default-active="defaultActive" :uniqueOpened="true" @select="onProdCatSelect">
                <el-menu-item v-for="(cat, index) of productCats" :key="index" :index="cat.id">
                    <i class="prod-cat-menu__menu-icon iconfont" :class="'icon-' + cat.icon"></i>
                    <div class="prod-cat-menu__menu-name">{{ cat.name }}</div>
                </el-menu-item>
            </el-menu>
            <i
                class="prod-cat-menu__trigger"
                :class="{
                    'el-icon-arrow-left': opened,
                    'el-icon-arrow-right': !opened,
                }"
                type="text"
                @click="opened = !opened"
            ></i>
        </div>
        
    </div> -->
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import apiProvider from "@/api/provider";
import { CategoryFilter, ProductCategory } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/variables.scss";
import { LabelValue } from "@/api/interface/common.interfact";
import MenuItem from "./MenuItem.vue";

export default defineComponent({
    // props: {
    //     opened: {
    //         type: Boolean,
    //         default: false,
    //     },
    // },
    components: {
        MenuItem,
    },
    emits: ["select", "filter"],
    setup(props, context) {
        props;
        const defaultActive = ref("" as number | string);

        const productCats = reactive([] as ProductCategory[]);
        const currentProdCat = ref<ProductCategory | undefined>();
        function onProdCatSelect(cid: string | number) {
            currentProdCat.value = productCats.find((pc) => pc.id === cid);
            context.emit("select", cid);
        }
        apiProvider.requestProductCategories().then((res) => {
            if (res.ok) {
                productCats.push(...(res.data || []));
                if (productCats.length > 0) {
                    defaultActive.value = productCats[0].id;
                    onProdCatSelect(defaultActive.value || "");
                }
            }
        });
        // const computeFilters = () => {
        //     return currentProdCat.value?.filters.map((f) => {
        //         let filter = [f.key];
        //         const filters = f.styles.filter((s) => s.selected).map((s) => s.value) as string[];
        //         filter = filter.concat(filters);
        //         return filter;
        //     });
        // };
        return {
            currentProdCat,
            productCats,
            variables,
            defaultActive,
            opened: ref(false),
            onStyleClick(filter: CategoryFilter, style: LabelValue) {
                style.selected = !style.selected;
                // context.emit("filter", computeFilters());
            },
            onProdCatSelect,
        };
    },
});
</script>

<style scoped lang="scss">
.prod-cat-menu {
    width: 260px;
}
</style>
