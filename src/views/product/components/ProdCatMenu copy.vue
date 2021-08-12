<template>
    <div class="prod-cat-menu">
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
        <el-collapse-transition-h>
            <div v-if="opened && currentProdCat" class="prod-cat-menu__filter">
                <!-- <div class="prod-cat-menu__filter-title">
                    调性选择 <el-button circle icon="el-icon-s-fold" @click="opened = false"></el-button>
                </div> -->
                <div class="prod-cat-menu__filter-style">
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
        </el-collapse-transition-h>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import apiProvider from "@/api/provider";
import { CategoryFilter, ProductCategory } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/variables.scss";
import { LabelValue } from "@/api/interface/common.interfact";

export default defineComponent({
    // props: {
    //     opened: {
    //         type: Boolean,
    //         default: false,
    //     },
    // },
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
        const computeFilters = () => {
            return currentProdCat.value?.filters.map((f) => {
                let filter = [f.key];
                const filters = f.styles.filter((s) => s.selected).map((s) => s.value) as string[];
                filter = filter.concat(filters);
                return filter;
            });
        };
        return {
            currentProdCat,
            productCats,
            variables,
            defaultActive,
            opened: ref(false),
            onStyleClick(filter: CategoryFilter, style: LabelValue) {
                style.selected = !style.selected;
                context.emit("filter", computeFilters());
            },
            onProdCatSelect,
        };
    },
});
</script>

<style scoped lang="scss">
.prod-cat-menu {
    height: 100%;
    display: flex;
    background-color: var(--el-color-bg);
    &__menu {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.el-menu) {
            // width: 80px !important;
            // background-color: chartreuse;
            overflow-y: auto;
        }

        :deep(.el-menu-item) {
            text-align: center;
            padding: 26px 14px 0 !important;
            line-height: 108px !important;
            height: 108px !important;
            background-color: $--color-primary-dark;
        }
        :deep(.el-menu-item.is-active) {
            background-color: $--color-bg;
        }

        &-icon {
            display: block;
            font-size: 40px;
            line-height: 40px !important;
        }
        &-name {
            font-size: 22px;
            font-weight: normal;
            margin-top: 7px;
            line-height: 22px !important;
        }
    }
    &__trigger {
        color: white;
        font-size: 20px;
        padding: 30px 20px;
        text-align: center;
        background-color: $--color-primary;

        &:hover {
            background-color: var(--el-color-primary-light-3);
        }
        &:active {
            background-color: $--color-primary-dark;
        }
    }
    &__filter {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        width: 185px;
        height: 100%;
        background-color: $--color-bg;
        box-shadow: 5px 0px 10px 0px rgba(0, 0, 0, 0.16);
        margin-right: 15px;
        white-space: nowrap;

        &-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 12px 0px 21px;
            font-size: 22px;
            font-weight: bold;
            color: $--color-black;
        }
        &-style {
            flex: 1;
            padding: 15px 17px 0px 25px;
            overflow-y: auto;

            &__item {
                padding: 10px 0px;
                &-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 22px;
                    font-weight: bold;
                    color: $--color-black;
                }
            }
        }

        .trigger-btn {
            width: 20px;
            height: 20px;
            min-height: 20px;
            padding: 0px;
            font-size: 12px;
        }

        .style-btn {
            display: block;
            margin-left: 0px;
            margin: 15px auto;
            width: 120px;
            height: 20px;
            padding: 0px;
        }
    }
}
</style>
