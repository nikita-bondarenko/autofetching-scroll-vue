import {ref} from 'vue'

export const useFetchData = ({limit, skip, cb}) => {
    const isFetching = ref(0)
    isFetching.value = true
    fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}&select=title,price,id`)
        .then(res => res.json())
        .then((data) => {
            isFetching.value = false
            cb(data)
        });

    return [isFetching]
}