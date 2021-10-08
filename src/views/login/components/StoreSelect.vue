<template>
    <el-select v-bind="$attrs" placeholder="请选择门店">
        <el-option v-for="store of storeList" :key="store.id" :label="store.name" :value="store.id"></el-option>
    </el-select>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import apiProvider from "@/api/provider";
import { Store } from "@/api/interface/provider.interface";

export default defineComponent({
    name: "StoreSelect",
    setup() {
        const storeList = ref<Store[]>([]);
        apiProvider.requestStoreList().then((res) => {
            storeList.value = res.data || [];
        });
        return {
            storeList,
        };
    },
});
</script>

<style scoped></style>
