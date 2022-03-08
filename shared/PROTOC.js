export class MessageType {
    static MOVE = 'MOVE'
    static THROW = 'THROW'
    static PLAYER_REMOVE = 'PLAYER_REMOVE'
    static PLAYER_ADD = 'PLAYER_ADD'
    static SNAPSHOT = 'SNAPSHOT'
}

export class ActorType {
    static UNKNOWN = 'UNKNOWN'
    static PLAYER = 'PLAYER'
    static OBSTACLE = 'OBSTACLE'

    static PICKUP= 'PICKUP'
    static BOMB = 'BOMB'
}

export class Actor {
    type = ActorType.UNKNOWN
    x = Number.NaN
    y = Number.NaN
    z = Number.NaN

    vx = Number.NaN
    vy = Number.NaN
    vz = Number.NaN

    bomb = false
    incapacitated = false

    constructor(type) {
        this.type = type
    }

    static _init = (self, x, y, z) => {
        self.x = x; self.y = y; self.z = z;
        self.vx = 0; self.vy = 0; self.vz = 0
        return self;
    }

    static createPlayer = (x, y, z = 0) => {
        return Actor._init(new Actor(ActorType.PLAYER), x, y, z)
    }

    /**
     * @param value
     * @return {Actor}
     */
    static createFromSnapshot = value => {
        value.x = Number.parseFloat(value.x)
        value.y = Number.parseFloat(value.y)
        return value
    }
}