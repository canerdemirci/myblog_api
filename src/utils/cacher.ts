import NodeCache from "node-cache"

export const cacher = new NodeCache()

export function clearCache() {
    cacher.flushAll()
}

export function delCacheKeys(keys: string[]) {
    cacher.keys().forEach(key => {
        keys.forEach(k => {
            if (key.includes(k)) {
                cacher.del(key)
            }
        })
    })
}