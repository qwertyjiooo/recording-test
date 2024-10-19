<template>
    <div style="background-color: rgb(37, 51, 125);display: flex;">
        <div style="display: flex;flex-direction: column;align-items: center;justify-content:center;margin-left: 15px;">
            <img src="../assets/logo.png" alt="" class="sidebar-icon" />
            <div style="display: flex;align-items:center;color:white;font-size: 18px;font-weight: 600;">
                AI智能笔录系统
            </div>
        </div>
        <div style="display: flex;flex-direction: column;flex: 1;margin-right: 15px;">
            <div style="display: flex;height: 50px;justify-content:right;align-items: center;">
                <button class="sidebar-item" :class="{ active: '0' === currentIndex }"
                    @click="handleClick('0')">卷宗信息</button>
                <div style="height: 50%;width: 2px;background-color: rgb(132, 156, 251);">
                </div>
                <button class="sidebar-item" :class="{ active: '1' === currentIndex }"
                    @click="handleClick('1')">历史笔录</button>
            </div>
            <div ref="listContentDiv"
                style="display: flex;min-height: 50px ;justify-content:end;align-items: center;flex-wrap: wrap;">
                <button class="neirong-item" v-for="(item, index) in itemList" :key="item.name"
                    :class="{ active: index === neirongIndex }" @click="handleNeieongClick(item, index)">{{ item.name
                    }}</button>
            </div>

        </div>
    </div>
</template>
<script lang="ts">
import {
    defineComponent, onUnmounted, inject, Ref, ref, watch, onMounted,
} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // 导入 useStore

export default defineComponent({
    setup() {
        const router = useRouter();
        const $store = useStore();
        const currentIndex = ref('0');
        const neirongIndex = ref(0);
        const itemList: Ref<{ name: string; path: string; select: boolean; recordInfo: Record<string, unknown> }[]> = inject('itemList', ref([]));
        const itemListAll = ref([]);
        const listContentDiv = ref<HTMLElement | null>(null);
        const updateAppHeight = inject<{ update:(newHeight: number) => void }>('updateAppHeight');
        const resizeObserver = new ResizeObserver(() => {
            if (listContentDiv.value) {
                if (updateAppHeight && typeof updateAppHeight.update === 'function') {
                    updateAppHeight.update(listContentDiv.value.offsetHeight);
                }
            }
        });
        onMounted(() => {
            if (listContentDiv.value) {
                resizeObserver.observe(listContentDiv.value);
            }
            if (itemList) {
                currentIndex.value = '0';
                // neirongIndex.value = 2;
                watch(itemList, (newValue) => {
                    if ($store.state.currentIndex === 1) {
                        neirongIndex.value = 2;
                    } else if ($store.state.currentIndex === 2) {
                        neirongIndex.value = 3;
                    } else if ($store.state.currentIndex === 3) {
                        neirongIndex.value = 1;
                    } else {
                        neirongIndex.value = $store.state.currentIndex;
                    }
                    console.log('itemListnewValue', newValue);
                    if (itemList.value.length > 0) {
                        const itemToMove = itemList.value.splice(3, 1)[0]; // 从数组中移除并获取第四个元素
                        itemList.value.splice(1, 0, itemToMove); // 在第二个位置插入该元素
                    }
                });
                // watch(itemList, (newValue) => {
                //     if (newValue.length > 0) {
                //         currentIndex.value = '0';
                //         neirongIndex.value = -1;
                //         for (let index = 0; index < newValue.length; index++) {
                //             const element = newValue[index];
                //             if (element.select) {
                //                 neirongIndex.value = index;
                //                 localStorage.setItem('recordInfo', JSON.stringify(element.recordInfo));
                //                 router.push(element.path);
                //             }
                //         }
                //     }
                // });
            }
            const queryIndex = router.currentRoute.value.query.currentIndex;
            console.log('queryIndex', queryIndex);
        });
        onUnmounted(() => {
            resizeObserver.disconnect();
        });
        function handleClick(value: string) {
            currentIndex.value = value;
            if (value === '0') {
                router.push({
                    path: '/',
                    query: {
                        currentIndex: value,
                    },
                });
            } else if (value === '1') {
                if (itemList) {
                    itemList.value = [];
                }
                router.push({
                    path: '/history-records',
                    query: {
                        currentIndex: value,
                    },
                });
            }
            console.log('router', router);
        }
        function handleNeieongClick(item: { name: string; path: string; recordInfo: Record<string, unknown> }, value: number) {
            neirongIndex.value = value;
            if (value === 1) {
                $store.commit('setCurrentIndex', 3);
            } else if (value === 2) {
                $store.commit('setCurrentIndex', 1);
            } else if (value === 3) {
                $store.commit('setCurrentIndex', 2);
            } else {
                $store.commit('setCurrentIndex', value);
            }
            localStorage.setItem('recordInfo', JSON.stringify(item.recordInfo));
            router.push(item.path);
        }
        return {
            itemList,
            itemListAll,
            neirongIndex,
            currentIndex,
            listContentDiv,
            handleClick,
            handleNeieongClick,
        };
    },
});
</script>
<style scoped>
.sidebar-icon {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

.sidebar-item {
    margin-left: 10px;
    margin-right: 10px;
    color: rgb(132, 156, 251);
    font-size: 18px;
    background-color: transparent;
    border: none;
}

.sidebar-item.active {
    font-size: 20px;
    color: white;
    font-weight: 600;
    text-decoration: none;
}

.neirong-item {
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 5px;
    color: rgb(132, 156, 251);
    font-size: 16px;
    background-color: transparent;
    border: none;
}

.neirong-item.active {
    font-size: 18px;
    color: white;
    font-weight: 600;
    text-decoration: none;
}
</style>
