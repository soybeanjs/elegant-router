import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { storeIdRecord } from '../../id';

export const useCounterStore = defineStore(storeIdRecord.counter, () => {
  const count = ref(0);

  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value += 1;
  }

  return { count, doubleCount, increment };
});
