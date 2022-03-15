
export const SharedConfig = {
    TARGET_FPS : 60,
    FRAME_LENGTH : 1/60,
    RECONSILE_DELTA : 30, // will reconsile with the speed of (1/delta)/sec

    ENV : 'UNKNOWN',
    DEBUG_LOSS : 0,
    DEBUG_LATENCY : [20, 50],
    URL : '127.0.0.1',
    PORT : 9208,
    FRAME_SKIP : 4,
    SSL_KEY : '',
    SSL_CERT : '',
    SSL_CA : '',

    DEBUG_LOCAL : {
        DEBUG_LOSS : 0.15,
        DEBUG_LATENCY: [50, 250],
        URL : '127.0.0.1',
        PORT : 9208,
        FRAME_SKIP: 4
    },

    DEBUG_REMOTE : {
        DEBUG_LOSS : 0,

        DEBUG_LATENCY: [0, 0],
        URL : 'https://nikitka.live',
        PORT : 9208,
        FRAME_SKIP: 4,
        SSL_KEY : '/etc/letsencrypt/live/nikitka.live/privkey.pem',
        SSL_CERT : '/etc/letsencrypt/live/nikitka.live/cert.pem',
        SSL_CA : '/etc/letsencrypt/live/nikitka.live/chain.pem',
    },

    init(env) {
        this.ENV = env
        const setup = this[env]
        Object.assign(this, setup)

        console.log(`starting up with ENV:${this.ENV}!`)
    }
}