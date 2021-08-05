<template>
    <div class="my">
        <div class="my__info">
            <fluid-bg class="my__info-bg" />

            <span class="my__info-my">我的</span>

            <div class="my__info-profile">
                <el-image
                    class="my__info-profile__avatar u-circle"
                    src="https://picsum.photos/200"
                    circle
                    fit="contain"
                />
                <span class="my__info-profile__username"> {{ user.userName }} </span>
                <i class="my__info-profile__location iconfont icon-shop"> 上海·长寿路旗舰店 </i>
                <!-- <el-tag class="app-header__job" type="primary" color="#5EB6B366">店长助理</el-tag> -->
            </div>
            <i class="my__info-settings icon-btn icon-settings" />
        </div>
        <div class="my__functions">
            <el-row :gutter="20" justify="center">
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="我的客户" icon="customer" color="#00FFF6" @click="gotoCustomerList" />
                </el-col>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="商品库" icon="products" color="#FF5E00" @click="gotoProductList" />
                </el-col>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="帮助手册" icon="manual" color="#FFBB00" @click="gotoXXX" />
                </el-col>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="设置" icon="settings" color="#0073FF" @click="gotoXXX" />
                </el-col>
                <div style="width: 100%; height: 30px"></div>
                <el-col v-for="index in 4" :key="index" :span="6" style="text-align: center">
                    <function-card functionName="待定菜单" icon="empty" color="grey" @click="gotoXXX" />
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus";
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import FluidBg from "./FluidBg.vue";
import FunctionCard from "./FunctionCard.vue";

export default defineComponent({
    components: {
        FunctionCard,
        FluidBg,
    },
    setup() {
        const store = useStore();
        const router = useRouter();
        return {
            user: computed(() => store.state.user),
            gotoCustomerList() {
                router.push("/customers");
            },
            gotoProductList() {
                router.push("/select-product");
            },
            gotoXXX() {
                ElMessage.warning("未实现");
            },
        };
    },
});
</script>

<style scoped lang="scss">
@import "~@/assets/scss/element-variables.scss";

.my {
    background-color: $--color-bg;
    &__info {
        z-index: 1;
        display: flex;
        position: relative;
        padding: 86px 51px 181px;
        justify-content: space-between;
        align-items: flex-start;

        &-bg {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }
        &-my {
            font-size: 40px;
            color: white;
        }
        &-profile {
            display: flex;
            flex-direction: column;
            align-items: center;

            &__avatar {
                width: 135px;
                height: 135px;
            }
            &__username {
                margin-top: 19px;
                font-size: 40px;
                color: white;
            }
            &__location {
                margin-top: 10px;
                font-size: 30px;
                color: white;
            }
        }
        &-settings {
            font-size: 35px;
            color: white;
        }
    }
    &__functions {
        z-index: 2;
        position: relative;
        background: white;
        box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.13);
        border-radius: 30px;
        width: 1232px;
        margin-left: auto;
        margin-right: auto;
        margin-top: -122px;
        padding: 50px 120px;
    }
}
</style>
