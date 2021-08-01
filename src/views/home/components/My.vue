<template>
    <div class="my__info">
        {{ user.userName }}
    </div>
    <div class="my__functions">
        <function-card functionName="我的客户" icon="function-mycustomer" />
        <function-card functionName="商品库" icon="function-product" />
        <function-card functionName="设置" icon="function-settings" />
        <function-card functionName="帮助" icon="function-help" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import FunctionCard from "./FunctionCard.vue";

export default defineComponent({
    components: {
        FunctionCard,
    },
    setup() {
        const store = useStore();
        return {
            user: computed(() => store.state.user),
        };
    },
});
</script>

<style scoped></style>
