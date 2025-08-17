//快速把obj1里面对应的数据复制到obj2
export default async function objCopy(source, target) {
    Object.keys(target).forEach(key => {
        target[key] = source[key]
    })
}
