<template>
    <div class="visitor-record">
        <div class="visitor-record-header">
            <el-button icon="el-icon-arrow-left" type="text" @click="$router.back()">返回</el-button>
            <span class="visitor-record-header__title">游客记录工具</span>
            <el-button class="visitor-record-header__add" type="primary" @click="addRecord">增加记录</el-button>
        </div>
        <el-table class="visitor-record-table" :data="currentPageData" height="100px" size="large" v-loading="loading">
            <el-table-column label="游客" prop="no" width="200" align="center" />
            <el-table-column label="进店时间" align="center">
                <template #default="scope">
                    <el-date-picker
                        v-model="scope.row.etime"
                        type="datetime"
                        placeholder="选择进店时间"
                        format="YYYY-MM-DD HH:mm"
                        @change="onItemChange(scope.$index, scope.row)"
                    >
                    </el-date-picker>
                </template>
            </el-table-column>
            <el-table-column label="离店时间" align="center">
                <template #default="scope">
                    <el-date-picker
                        v-model="scope.row.ltime"
                        type="datetime"
                        placeholder="选择离店时间"
                        format="YYYY-MM-DD HH:mm"
                        @change="onItemChange(scope.$index, scope.row)"
                    >
                    </el-date-picker>
                </template>
            </el-table-column>
            <el-table-column label="" width="200" align="right">
                <template #default="scope">
                    <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty v-if="loadState === 'empty'"></el-empty>
                <load-more v-else :state="loadState"></load-more>
            </template>
        </el-table>
        <div class="visitor-record-pagination">
            <el-button class="" type="primary" :disabled="currentPageNum <= 1" @click="prevPage">上一页</el-button>
            <span v-if="currentPageNum" class="visitor-record-pagination__page">第{{ currentPageNum }}页</span>
            <el-button class="" type="primary" :disabled="disableNextBtn" @click="nextPage">下一页</el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { StateType } from "@/store";
import PageScroll, { LOAD_STATE } from "@/utils/page-scroll";
import apiProvider from "@/api/provider";
import LoadMore from "@/components/LoadMore.vue";
import { VisitorRecordItem } from "@/api/interface/provider.interface";

export default defineComponent({
    name: "VisitorRecord",
    components: {
        LoadMore,
    },
    setup() {
        const store = useStore<StateType>();
        const eid = store.state.user.eid;

        const currentPageNum = ref(1);
        const loading = ref(false);

        function requestApi(pageNum: number, pageSize: number) {
            loading.value = true;
            return apiProvider.requestVisitorRecordList(eid, pageNum, pageSize);
        }
        const loadState = ref<LOAD_STATE>("");
        const recordList = ref<VisitorRecordItem[]>([]);
        const currentPageData = computed<VisitorRecordItem[]>(() => {
            if (currentPageNum.value === 0 || recordList.value.length === 0) {
                return [];
            }
            const start = (currentPageNum.value - 1) * pageScroll.pageSize;
            const end = start + pageScroll.pageSize;
            return recordList.value.slice(start, end);
        });
        const pageScroll = new PageScroll(undefined, requestApi, loadState, recordList, {
            onDataFinish: () => {
                loading.value = false;
            },
        });
        pageScroll.requestPageIfAllowed();

        function reloadAll() {
            pageScroll.reload();
            currentPageNum.value = 1;
        }

        async function addRecord() {
            await apiProvider.recordVisitor(eid);
            reloadAll();
        }
        async function handleDelete(index: number, row: VisitorRecordItem) {
            await apiProvider.deleteVisitorItem(row.no);
            reloadAll();
        }
        async function onItemChange(index: number, row: VisitorRecordItem) {
            await apiProvider.updateVisitorItem(row);
        }
        function prevPage() {
            if (currentPageNum.value <= 1) {
                return;
            }
            currentPageNum.value--;
        }
        function nextPage() {
            if (currentPageNum.value < pageScroll.currentPage) {
                currentPageNum.value++;
            } else {
                const promise = pageScroll.requestPageIfAllowed();
                if (promise) {
                    promise.then((_res) => {
                        currentPageNum.value++;
                    });
                } else {
                    ElMessage.warning("没有更多了");
                }
            }
        }
        return {
            loading,
            loadState,
            pageScroll,
            recordList,
            currentPageNum,
            currentPageData,
            addRecord,
            handleDelete,
            onItemChange,
            prevPage,
            nextPage,
            disableNextBtn: computed(() => {
                if (currentPageNum.value < pageScroll.currentPage) {
                    return false;
                }
                return ["nomore", "loading", "empty"].includes(loadState.value);
            }),
        };
    },
});
</script>

<style lang="scss" scoped>
.visitor-record {
    max-width: 1440px;
    height: 100%;
    overflow: hidden;
    margin: 40px auto 20px;
    display: flex;
    flex-direction: column;

    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &__title {
            font-size: x-large;
            font-weight: bold;
        }
    }
    &-table {
        margin-top: 20px;
        margin-bottom: 20px;
        width: 1000px;
        flex: 1;
    }

    &-pagination {
        text-align: right;
        &__page {
            margin: 0 10px;
        }
    }
    :deep(.el-date-editor) {
        --el-date-editor-width: 250px;
    }
}
</style>
