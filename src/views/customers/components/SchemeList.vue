<template>
    <el-row ref="elRow" class="scheme-list" :gutter="20">
        <el-col :span="colSpan" style="text-align: center; padding-top: 10px; padding-bottom: 10px">
            <new-scheme-card @new="newScheme" />
        </el-col>
        <el-col
            v-for="(s, index) in schemeList"
            :key="index"
            :span="colSpan"
            style="text-align: center; padding-top: 10px; padding-bottom: 10px"
        >
            <scheme-card :offer="offer" :scheme="s" @detail="gotoDetail(s)" />
        </el-col>
        <!-- <load-more :state="loadState" /> -->
    </el-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import apiProvider from "@/api/provider";
import { Scheme } from "@/api/interface/provider.interface";
import SchemeCard from "./SchemeCard.vue";
import NewSchemeCard from "./NewSchemeCard.vue";

export default defineComponent({
    name: "SchemeList",
    components: {
        SchemeCard,
        NewSchemeCard,
    },
    props: {
        svcId: {
            type: Number,
            default: 0,
        },
        offer: {
            type: Boolean,
            default: true,
        },
        menu: {
            type: Boolean,
            default: true,
        },
    },
    emits: ["new-scheme", "detail"],
    setup(props, ctx) {
        const schemeList = ref<Scheme[]>([]);

        apiProvider.requestSchemes(props.svcId).then((res) => {
            if (res.ok && res.data) {
                schemeList.value.length = 0;
                schemeList.value.push(...res.data);
            }
        });
        return {
            schemeList,
            colSpan: computed(() => (props.menu ? 8 : 6)),
            newScheme() {
                ctx.emit("new-scheme");
            },
            gotoDetail(scheme: Scheme) {
                ctx.emit("detail", scheme);
            },
        };
    },
});
</script>

<style scoped></style>
