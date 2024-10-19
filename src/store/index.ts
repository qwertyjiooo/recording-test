import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      currentIndex: 0,
      dialogTableVisibleIndex: undefined,
      CurrentDialogTableVisibleIndex: false,
    };
  },
  mutations: {
    setCurrentIndex(state, index) {
      state.currentIndex = index;
    },
    setDialogTableVisibleIndex(state, index) {
      state.dialogTableVisibleIndex = index;
    },
    setCurrentDialogTableVisibleIndex(state) {
      state.CurrentDialogTableVisibleIndex = !state.CurrentDialogTableVisibleIndex;
    },
  },
});
export default store;
// export default createStore({
//   state: {
//   },
//   getters: {
//   },
//   mutations: {
//   },
//   actions: {
//   },
//   modules: {
//   },
// });
