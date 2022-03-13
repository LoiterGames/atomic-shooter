//assetId=72710224
'use strict';

//--

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var MessageType = {
  MOVE: 'MOVE',
  THROW: 'THROW',
  PLAYER_REMOVE: 'PLAYER_REMOVE',
  PLAYER_ADD: 'PLAYER_ADD',
  SNAPSHOT: 'SNAPSHOT'
};
var ActorType = {
  UNKNOWN: 'UNKNOWN',
  PLAYER: 'PLAYER',
  OBSTACLE: 'OBSTACLE',
  PICKUP: 'PICKUP',
  BOMB: 'BOMB'
};
var Actor = /*#__PURE__*/_createClass(function Actor(type) {
  _classCallCheck(this, Actor);

  _defineProperty(this, "type", ActorType.UNKNOWN);

  _defineProperty(this, "x", Number.NaN);

  _defineProperty(this, "y", Number.NaN);

  _defineProperty(this, "z", Number.NaN);

  _defineProperty(this, "vx", Number.NaN);

  _defineProperty(this, "vy", Number.NaN);

  _defineProperty(this, "vz", Number.NaN);

  _defineProperty(this, "bomb", false);

  _defineProperty(this, "incapacitated", false);

  this.type = type;
});

_defineProperty(Actor, "_init", function (self, x, y, z) {
  self.x = x;
  self.y = y;
  self.z = z;
  self.vx = 0;
  self.vy = 0;
  self.vz = 0;
  return self;
});

_defineProperty(Actor, "createPlayer", function (x, y) {
  var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return Actor._init(new Actor(ActorType.PLAYER), x, y, z);
});

_defineProperty(Actor, "createFromSnapshot", function (value) {
  value.x = Number.parseFloat(value.x);
  value.y = Number.parseFloat(value.y);
  return value;
});

var GP = {
  player: {
    speed: 1.5
  }
};

var SharedConfig = {
  TARGET_FPS: 60,
  FRAME_LENGTH: 1 / 60,
  RECONSILE_EPSILON: 0.01,
  ENV: 'UNKNOWN',
  DEBUG_LOSS: 0,
  DEBUG_LATENCY: [20, 50],
  URL: '127.0.0.1',
  PORT: 9208,
  FRAME_SKIP: 4,
  SSL_KEY: '',
  SSL_CERT: '',
  SSL_CA: '',
  DEBUG_LOCAL: {
    DEBUG_LOSS: 0.15,
    DEBUG_LATENCY: [50, 250],
    URL: '127.0.0.1',
    PORT: 9208,
    FRAME_SKIP: 4
  },
  DEBUG_REMOTE: {
    DEBUG_LOSS: 0,
    DEBUG_LATENCY: [0, 0],
    URL: 'https://nikitka.live',
    PORT: 9208,
    FRAME_SKIP: 4,
    SSL_KEY: '/etc/letsencrypt/live/nikitka.live/privkey.pem',
    SSL_CERT: '/etc/letsencrypt/live/nikitka.live/cert.pem',
    SSL_CA: '/etc/letsencrypt/live/nikitka.live/chain.pem'
  },
  init: function init(env) {
    this.ENV = env;
    var setup = this[env];
    Object.assign(this, setup);
    console.log("starting up with ENV:".concat(this.ENV, "!"));
  }
};

//--
//--
//--
//--
//--
