import { createApp, ref, watch, reactive } from 'vue'
import { useFetchData } from './useFetchData.js';
createApp({
    setup() {

        const observerOptions = {
            threshold: 1.0,
        };

        const initialLimit = 30
        const addItemsLimit = 10
        const observedElementDistanceToBorder = 2

        const products = ref([])
        const totalProductsAmount = ref(0)
        const list = ref(null)
        const isFetching = ref(false)
        const topElementVisible = ref(false)
        const bottomElementVisible = ref(false)

        const [isInitDataFetching] = useFetchData({
            limit: initialLimit, skip: 0, cb: (data) => {
                const result = data.products.map((item, index) => ({ ...item, number: index + 1 }))
                products.value = result
                totalProductsAmount.value = data.total
            }
        })

        watch(isInitDataFetching, (value) => {
            isFetching.value = value
        }, {immediate: true})


 

        const topCallback = (entries, observer) => {
            entries.forEach((entry) => {
                topElementVisible.value = entry.isIntersecting
            });
        };

        const topObserver = new IntersectionObserver(topCallback, observerOptions);

        const setTopElement = (el) => {
            if (el) {
                topObserver.observe(el)

            }
        }

        const bottomCallback = (entries, observer) => {
            entries.forEach((entry) => {
                bottomElementVisible.value = entry.isIntersecting
            });
        };

        const bottomObserver = new IntersectionObserver(bottomCallback, observerOptions);

        const setBottomElement = (el) => {
            if (el) {
                bottomObserver.observe(el)

            }
        }


        watch(topElementVisible, (value) => {
            console.log('topElementVisible', value)
           if (isFetching.value)  return
            if (value && products.value[0].id !== 1) {
                let limit = addItemsLimit
                const difference = products.value[0].id - limit - 1
                let skip
                if (difference >= 0) {
                    skip = difference
                } else {
                    skip = 0
                    limit += difference
                }
                isFetching.value = true
                useFetchData({
                    limit, skip, cb: (data) => {
                        products.value = [...data.products, ...products.value.slice( 0,products.value.length - addItemsLimit)]

                            isFetching.value = false
                       if (list.value.scrollTop === 0) {
                        list.value.scrollTop = 5
                       }
                    }
                })
            }
        })

        watch(bottomElementVisible, (value) => {
            console.log('bottomElementVisible', value)
            if (isFetching.value)  return

            if (value) {
                const skip = products.value[products.value.length - 1].id
                isFetching.value = true

                useFetchData({
                    limit: addItemsLimit, skip, cb: (data) => {
                        console.log(products.value)
                        const arr = products.value.slice(addItemsLimit)
                        products.value = data.products.reduce((arr, item, index) => [...arr, { ...item }], arr)
                        isFetching.value = false

                    }
                })
            }

        })

        return {
            products,
            setTopElement,
            setBottomElement,
            list,
            observedElementDistanceToBorder
        }
    },
}).mount('#app')