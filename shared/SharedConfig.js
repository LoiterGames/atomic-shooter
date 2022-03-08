
export default class SharedConfig {
    static ENV = 'DEBUG'
    static TARGET_FPS = 60
    static DEBUG_LOSS = 0
    static DEBUG_LATENCY = [20, 50]
    static FRAME_LENGTH = 1/SharedConfig.TARGET_FPS
    static FRAME_SKIP = 4
    static PORT = 9208
    static RECONSILE_EPSILON = 0.01
}