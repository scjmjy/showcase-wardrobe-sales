<template>
    <div class="metal-item">
        <div class="metal-item__title">{{ metal.name }}</div>
        <div class="metal-item__detail">
            <el-image></el-image>
            <div>
                <div>
                    <el-select v-model="result.brand"></el-select>
                    <div>
                        颜色
                        <el-select v-model="result.color"></el-select>
                    </div>
                    <div>
                        材质
                        <el-select v-model="result.material"></el-select>
                    </div>

                    <el-input-number
                        v-model="result.count"
                        @change="handleChange"
                        :min="1"
                        :max="10"
                        label="数量"
                    ></el-input-number>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
    name: "MetalItem",
    props: {
        metal: {
            type: Object,
            default: () => ({}),
        },
        // result: {
        //     type: Object,
        //     default: () => ({}),
        // },
    },
    setup() {
        const result = reactive({
            count: 0,
            color: "",
            brand: "",
            material: "",
        });
        return {
            result,
        };
    },
});
</script>

<style scoped></style>
