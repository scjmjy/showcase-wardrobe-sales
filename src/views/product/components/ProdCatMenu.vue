<template>
    <el-menu ref="elMenu" v-bind="$attrs" class="prod-cat-menu" :default-active="defaultActive">
        <template v-for="cat of productCats" :key="cat.id">
            <el-sub-menu v-if="cat.children && cat.children.length" :index="cat.id + ''" :class="'el-submenu-' + level">
                <template #title>{{ cat.name }}</template>
                <menu-item :category="cat" :level="level + 1" />
            </el-sub-menu>
            <el-menu-item v-else :index="cat.id + ''" :class="'el-menu-item-' + level">
                <template #title>{{ cat.name }}</template>
            </el-menu-item>
        </template>
    </el-menu>
    <!-- <sidebar-menu :menu="menu" theme="white-theme"></sidebar-menu> -->
</template>

<script lang="ts">
import { computed, DefineComponent, defineComponent, nextTick, reactive, ref } from "vue";
import apiProvider from "@/api/provider";
import { CategoryFilter, findDefaultActiveProdCat, ProductCategory } from "@/api/interface/provider.interface";
import variables from "@/assets/scss/variables.scss";
import { LabelValue } from "@/api/interface/common.interface";
import MenuItem from "./MenuItem.vue";
import { ElMenu } from "element-plus";

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
    props: {
        level: {
            type: Number,
            default: 1,
        },
    },
    setup(props, context) {
        const elMenu = ref<InstanceType<typeof ElMenu>>();
        const defaultActive = ref("" as number | string);
        const defaultOpeneds = ref([] as string[]);

        const productCats = reactive([] as ProductCategory[]);
        // const currentProdCat = ref<ProductCategory | undefined>();
        // function onProdCatSelect(cid: string | number) {
        //     currentProdCat.value = productCats.find((pc) => pc.id === cid);
        //     context.emit("select", cid);
        // }
        apiProvider.requestProductCategories().then((res) => {
            if (res.ok) {
                productCats.push(...(res.data || []));
                if (productCats.length > 0) {
                    // productCats.forEach((item, index) => {
                    //     defaultOpeneds.value.push(item.id + "");
                    // });
                    // defaultOpeneds.value.push(productCats[0].id.toString());
                    nextTick(() => {
                        // defaultOpeneds.value.forEach((sub) => {
                        //     elMenu.value?.open(sub);
                        // });

                        defaultActive.value = findDefaultActiveProdCat(productCats);
                        context.emit("select", defaultActive.value);
                    });
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
            elMenu,
            // currentProdCat,
            productCats,
            variables,
            defaultActive,
            defaultOpeneds,
            opened: ref(false),
            onStyleClick(filter: CategoryFilter, style: LabelValue) {
                style.selected = !style.selected;
                // context.emit("filter", computeFilters());
            },
            menu: [
                {
                    header: "Main Navigation",
                    hiddenOnCollapse: true,
                },
                {
                    title: "Dashboard",
                },
                {
                    title: "Charts",
                    child: [
                        {
                            title: "Sub Link",
                            child: [
                                {
                                    title: "Sub Link",
                                },
                                {
                                    title: "Sub Link 2",
                                    child: [
                                        {
                                            title: "Sub Link",
                                        },
                                        {
                                            title: "Sub Link 2",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    },
});
</script>

<style scoped lang="scss">
.prod-cat-menu {
    width: 260px;
    background-color: white;
    :deep(.el-menu) {
        background-color: white;
    }
}
</style>

<style lang="scss">
.prod-cat-menu {
    // padding-right: 20px;
    .el-menu--inline {
        margin-left: 30px;
        &::before {
            background-color: var(--el-color-primary);
            position: absolute;
            width: 2px;
            height: 100%;
            left: -5px;
            content: " ";
        }
    }
    .el-menu-item {
        border-radius: 6px;
        padding: 0 20px !important;
        &:hover {
            background-color: var(--el-menu-item-hover-fill);
        }
    }
    .el-sub-menu__title {
        border-radius: 6px;
        padding: 0 20px !important;
        i {
            // color: var(--el-color-primary);
            font-weight: bold;
            font-size: 16px;
        }
    }
    .el-sub-menu__icon-arrow {
        // background-color: var(--el-color-info);
        background-color: #afafaf;
        border-radius: 50%;
        padding: 2px;
        font-size: 12px !important;
        color: white;
    }
    .el-submenu-1 {
        .el-sub-menu__title {
            color: var(--el-color-primary);
            font-weight: bold;
        }
    }
    .el-submenu-2 {
        .el-sub-menu__title {
            color: var(--el-color-black);
            font-weight: bold;
            font-size: 22px;
        }

        .el-menu--inline {
            &::before {
                width: 1px;
            }
        }
    }
    .el-submenu-3 {
        background-color: white;
    }
    .el-menu-item-1 {
        background-color: white;
        color: black;
        font-weight: bold;
    }
    .el-menu-item-2 {
        background-color: white;
        // color: var(--el-color-primary);
        font-weight: bold;
        font-size: 22px;
    }
    .el-menu-item-3 {
        color: black;
        background-color: white;
        font-size: 22px;
    }
    // .el-submenu-2.is-opened {
    //     .el-menu {
    //         background-color: #e8e8e8;

    //         .el-menu-item {
    //             background-color: #e8e8e8;
    //         }
    //     }
    // }
    .el-menu-item.is-active {
        color: white;
        background-color: var(--el-color-primary-light-5) !important;
        position: relative;
        // &::before {
        //     font-family: "element-icons" !important;
        //     position: absolute;
        //     content: "\e720";
        //     left: 15px;
        // }
    }
}
</style>
