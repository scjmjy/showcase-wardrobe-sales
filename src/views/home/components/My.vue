<template>
    <div class="my">
        <div class="my__info">
            <!-- <fluid-bg class="my__info-bg" /> -->

            <!-- <span class="my__info-my">我的</span> -->

            <div class="my__info-profile">
                <el-image
                    class="my__info-profile__avatar u-circle"
                    src="https://picsum.photos/200"
                    circle
                    fit="contain"
                    style="visibility: hidden"
                />
                <span class="my__info-profile__username"> {{ user.userName }} </span>
                <i class="my__info-profile__location iconfont icon-shop"> &nbsp;{{ user.organization }} </i>
                <!-- <el-tag class="app-header__job" type="primary" color="#5EB6B366">店长助理</el-tag> -->
            </div>
            <!-- <i class="my__info-settings icon-btn icon-settings" /> -->
        </div>
        <div class="my__functions">
            <el-row :gutter="20">
                <el-col :span="6" style="text-align: center">
                    <function-card
                        functionName="我的客户"
                        icon="customer-2"
                        color="#A35443"
                        @click="gotoCustomerList"
                    />
                </el-col>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="商品库" icon="products-2" color="#D69F67" @click="gotoProductList" />
                </el-col>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="帮助手册" icon="manual-2" color="#D7CBBF" @click="gotoXXX" />
                </el-col>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="设置" icon="settings-fill-2" color="#859DA7" @click="gotoXXX" />
                </el-col>
                <!-- <div style="width: 100%; height: 30px"></div>
                <el-col :span="6" style="text-align: center">
                    <function-card functionName="工具" icon="empty" color="grey" @click="gotoXXX" />
                </el-col> -->
            </el-row>
        </div>
    </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus";
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import FunctionCard from "./FunctionCard.vue";

export default defineComponent({
    components: {
        FunctionCard,
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
.my {
    background-color: var(--el-color-bg);
    height: 100%;
    &__info {
        display: flex;
        padding: 30px 51px 80px;
        justify-content: space-around;
        align-items: flex-start;
        background-image: url(~@/assets/img/bg-my.png);
        background-size: cover;

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
        // background: white;
        padding: 50px 120px;
        width: 100%;
    }
}
</style>
