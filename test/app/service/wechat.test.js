const assert = require('assert');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/service/wechat.test.js', () => {
  it('sign', () => {
    const ctx = app.mockContext();
    const option = {
      appid: 'wxd930ea5d5a258f4f',
      mch_id: 10000100,
      device_info: 1000,
      body: 'test',
      nonce_str: 'ibuaiVcKdpRxkhJA',
    };
    const sign = '9A0A8659F005D6984697E2CA0A9CF3B7';

    assert.equal(ctx.service.wechat.sign(option), sign);
  });

  it('verify', () => {
    const ctx = app.mockContext();
    const response = {
      appid: 'wx2421b1c4370ec43b',
      attach: '支付测试',
      bank_type: 'CFT',
      fee_type: 'CNY',
      is_subscribe: 'Y',
      mch_id: '10000100',
      nonce_str: '5d2b6c2a8db53831f7eda20af46e531c',
      openid: 'oUpF8uMEb4qRXf22hE3X68TekukE',
      out_trade_no: '1409811653',
      result_code: 'SUCCESS',
      return_code: 'SUCCESS',
      sign: '594B6D97F089D24B55156CE09A5FF412',
      sub_mch_id: '10000100',
      time_end: '20140903131540',
      total_fee: '1',
      trade_type: 'JSAPI',
      transaction_id: '1004400740201409030005092168',
    };

    assert(ctx.service.wechat.verify(response));
  });

  it('nonceStr', () => {
    const ctx = app.mockContext();
    assert(ctx.service.wechat.nonceStr(6, 'a'), 'aaaaaaa');
  });

  it('request', async () => {
    const ctx = app.mockContext();
    app.mockHttpclient(/\/wechat-test$/i, {
      data: '<xml><a>b</a></xml>',
    });

    const resp = await ctx.service.wechat.request('/wechat-test');
    assert.deepEqual(resp.data, {
      a: 'b',
    });
  });

  it('xml2Object', () => {
    const ctx = app.mockContext();
    assert.deepEqual(ctx.service.wechat.xml2Object('<xml><out_trade_no><![CDATA[123]]></out_trade_no><result_code><![CDATA[SUCCESS]]></result_code><return_code><![CDATA[SUCCESS]]></return_code></xml>'), {
      out_trade_no: '123',
      result_code: 'SUCCESS',
      return_code: 'SUCCESS',
    });
  });

  it('object2Xml', () => {
    const ctx = app.mockContext();
    assert.deepEqual(ctx.service.wechat.object2Xml({
      out_trade_no: '123',
      result_code: 'SUCCESS',
      return_code: 'SUCCESS',
    }), '<xml><out_trade_no>123</out_trade_no><result_code>SUCCESS</result_code><return_code>SUCCESS</return_code></xml>');
  });
});
