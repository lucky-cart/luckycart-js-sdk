const should = require('should');
const sdk = require('../src/luckycart');

describe('LuckyCart SDK', () => {
  const SECRET_KEY = 'p#91J#i&00!QkdSPjgGNJq';
  const initSDK = (options = null) => new LuckyCart('ugjArgGw', SECRET_KEY, options);

  it('should find the library', () => {
    should(sdk).not.be.undefined();
  });

  it('should not init without api key', () => {
    should(() => new LuckyCart()).throw('Missing auth parameters');
  });

  it('should not init without api secret', () => {
    should(() => new LuckyCart('apikey')).throw('Missing auth parameters');
  });

  it('should init', () => {
    initSDK();
  });

  it('should get the unknown shopper when no shopper has been set', () => {
    const luckycartSDK = initSDK();
    should(luckycartSDK.getShopper()).be.equal('unknown');
  });

  it('should set a shopper', () => {
    const luckycartSDK = initSDK();
    luckycartSDK.setShopper('shopper01');
    should(luckycartSDK.getShopper()).be.equal('shopper01');
  });

  it('should get the default subset', () => {
    const luckycartSDK = initSDK();
    should(luckycartSDK.getSubset()).be.equal('desktop');
  });

  it('should set a subset', () => {
    const luckycartSDK = initSDK();
    luckycartSDK.setSubset('mobile');
    should(luckycartSDK.getSubset()).be.equal('mobile');
  });

  it('should get an error if setting a subset not supported', () => {
    const luckycartSDK = initSDK();
    should(() => luckycartSDK.setSubset('wrong_subset')).throw('Subset "wrong_subset" is not valid, should be: [desktop|mobile|webmobile]');
  });

  it('should get the device associated to the desktop subset', () => {
    const luckycartSDK = initSDK();
    should(luckycartSDK.getDevice()).be.equal('desktop');
  });

  it('should get the device associated to the mobile subset', () => {
    const luckycartSDK = initSDK({ subset: 'mobile' });
    should(luckycartSDK.getDevice()).be.equal('mobile');
  });

  it('should get the device associated to the webmobile subset', () => {
    const luckycartSDK = initSDK({ subset: 'webmobile' });
    should(luckycartSDK.getDevice()).be.equal('mobile');
  });

  it('should sign data correctly', () => {
    const luckycartSDK = initSDK();
    const ts = '1644854141';
    const signed = luckycartSDK.signData(ts, SECRET_KEY).toString();
    should(signed).be.equal('f729f85782c90d0f4b9eb1c3842df11c12dd4925a39fbb433813fed2efc65b68');
  });
});
