import SharedConfig from "@bomb/shared/SharedConfig.js";

export const addLatencyAndPackagesLoss = () => {
    return new Promise(resolve => {
        if (Math.random() < SharedConfig.DEBUG_LOSS) return resolve(true)
        setTimeout(
            () => resolve(false),
            SharedConfig.DEBUG_LATENCY[0] + Math.random() * SharedConfig.DEBUG_LATENCY[1])
    })
}

/**
 * @param map {Map<Types.ChannelId, Actor>}
 * @param id {Types.ChannelId}
 * @param message {string}
 * @return {Actor | undefined}
 */
export const handlePlayer = (map, id, message) => {
    const result = map.get(id)
    if (result) return result

    console.error(`player with id ${id} was not found, will skip message ${message}`)

    return undefined
}