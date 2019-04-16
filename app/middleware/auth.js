const TOKEN = 'access_token';
const SESSION_RULE = {
  properties: {
    role: {
      enum: ['1', '2'],
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-4][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
  },
  required: ['role', 'id'],
  additionalProperties: false,
};

/* istanbul ignore next */
module.exports = option => function* (next) {
  const token = this.headers[TOKEN] || this.cookies.get(TOKEN, { signed: false });
  const ret = yield this.app.redis.get(`${option.prefix}:${token}`);
  if (!ret) {
    this.state.auth = Object.assign({}, this.state.auth);
    yield next;
    return;
  }

  let session = null;
  try {
    session = JSON.parse(ret);
    this.assert(this.helper.ajv.validate(SESSION_RULE, session || {}));
  } catch (e) {
    yield this.app.redis.set(`${option.prefix}:${token}`, null);
    this.cookies.set(TOKEN, null);
    this.error('Session已失效, 请重新登录', 10001, 401);
  }

  const user = yield this.app.model.User.findById(session.id);

  this.assert(user, 401, 'Session已失效，请重新登录');
  this.state.auth = Object.assign({}, this.state.auth, {
    token,
    role: session.role,
    user: user.toJSON(),
  });

  yield next;
};
