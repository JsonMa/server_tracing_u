'use strict';
const Service = require('../lib/DBService');

class AccountAppService extends Service {
  constructor(ctx) {
    super(ctx, 'AccountApp');
  }

  async login(loginInfo) {
    const {
      service,
      ctx,
    } = this;
    const accountAppFiled = {
      nickname: '1',
      password: '1',
      account_id: '1',
      personal: '1',
      avatar: '1',
      id: '1',
    };

    await service.account.authValid(loginInfo.name);
    const account = await service.account.findOne({
      type: 'APP',
      tel: loginInfo.name,
    });
    if (!account) {
      ctx.error(false, ctx.__('account_or_password_error'));
    }

    let accountApp = await this.findOne({
      account_id: account._id,
    }, accountAppFiled);
    ctx.error(accountApp, ctx.__('data_error'));
    if (!accountApp.password) {
      ctx.error(false, ctx.__('account_needs_registered'));
    }
    accountApp = await this.findOne({
      account_id: account._id,
      password: loginInfo.password,
    }, accountAppFiled);
    if (!accountApp) {
      await service.account.setAuthTime(loginInfo.name, false);
      ctx.error(false, ctx.__('account_or_password_error'));
    }

    await service.account.setAuthTime(loginInfo.name, true);
    Object.assign(accountApp, {
      last_login: new Date(),
    });
    const result = accountApp.toJSON();
    delete result.password;
    await accountApp.save();

    // 添加一个字段registered表明是否已注册
    Object.assign(result, {
      registered: true,
    });

    return result;
  }

  async register(registerInfo) {
    const {
      service,
      ctx,
    } = this;

    // 验证是否已注册
    let existAccount = await service.account.findOne({
      type: 'APP',
      tel: registerInfo.tel,
    });

    if (!existAccount) {
      // 用户不存在，注册用户
      existAccount = await service.account.create({
        type: 'APP',
        tel: registerInfo.tel,
      });
      await this.create({
        nickname: await service.accountHePassport.generateNickname(),
        account_id: existAccount._id,
        password: registerInfo.password,
      });
      await this.addAddressGroup(existAccount._id).catch(err => {
        ctx.error(false, '创建用户默认分组错误', err);
      });
    } else {
      const existAccountApp = await service.accountApp.findOne({
        account_id: existAccount._id,
      }, {
        password: '1',
      });
      ctx.assert(!existAccountApp.password, ctx.__('tel_been_registered'));

      // 用户存在但未注册
      Object.assign(existAccountApp, {
        password: registerInfo.password,
      });
      await existAccountApp.save();
    }
  }

  async findMany(conditions, fields = null, options = {}) {
    return super.findMany(conditions, this.service.accountAdmin.checkField(fields), options);
  }

  async findOne(conditions, fields = null) {
    return super.findOne(conditions, this.service.accountAdmin.checkField(fields));
  }

  // 增加默认房间分组
  async addAddressGroup(uid) {
    const {
      ctx,
    } = this;
    const group = await ctx.service.addressGroup.create({
      name: '我的家',
      user_id: uid,
      type: 'DEFAULT',
    });
    const subGroup = ['主卧', '次卧', '客厅'].map((n, index) => ({
      type: 'NORMAL',
      name: n,
      parent_id: group._id,
      sort: index,
    }));
    await ctx.service.addressGroup.insertMany(subGroup);
  }
}

module.exports = AccountAppService;
