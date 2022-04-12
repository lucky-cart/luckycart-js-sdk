const { chromium } = require('playwright');
const path = require('path');
const should = require('should');

const hosts = {
  api: 'https://api.luckycart.com',
  promo: 'https://promomatching.luckycart.com',
};

describe('E2e tests', () => {
  let page;
  let browser;
  before(async () => {
    // remove exit:true in .mocharc to keep browser open at the end of the test
    browser = await chromium.launch({
      devtools: true,
      args: [
        '--disable-web-security',
      ],
    });
  });
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(`file:${path.resolve(__dirname, 'test.html')}`, { waitUntil: 'load' });
  });

  describe('Sdk init', () => {
    it('should have the correct page title', async () => {
      should(await page.title()).be.equal('SDK test Page');
      await page.close();
    });

    it('should init the sdk', async () => {
      await page.evaluate(() => new LuckyCart('ugjArgGw', 'p#91J#i&00!QkdSPjgGNJq'));
      await page.close();
    });
  });

  describe('Slideshow display', () => {
    it('should not display a slider if no promotions is available', async () => {
      await page.route(`${hosts.promo}/ugjArgGw/unknown/banners/mobile/homepage/banner?allPromotions=true`, (route) => {
        route.fulfill({
          body: JSON.stringify({ promo: [] }),
        });
      });

      const slider = await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        return luckycartSDK.getSlideShow('homepage', 'banner');
      });
      should(slider).be.null();
      await page.close();
    });

    it('should display a slider', async () => {
      await page.route(`${hosts.promo}/ugjArgGw/unknown/banners/mobile/homepage/banner?allPromotions=true`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            promo: [
              {
                image: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/image?meta=61e156ffb1a66b5615111f1e',
                href: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/jump?meta=61e156ffb1a66b5615111f1e',
                camp: '61e156ffb1a66b5615111f1e',
              },
            ],
          }),
        });
      });
      await page.route(`${hosts.promo}/61d6c677baa1676dd46bfee6/unknown/raw?meta=61e156ffb1a66b5615111f1e&`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            promo: true,
            imageType: 'image',
            camp: '61e156ffb1a66b5615111f1e',
            space: '61d6c677baa1676dd46bfee6',
            name: 'SDK campaign',
          }),
        });
      });

      await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const slider = await luckycartSDK.getSlideShow('homepage', 'banner');
        document.querySelector('#root').append(slider);
      });
      const count = await page.locator('.splide').count();
      should(count).be.equal(1);
      const slideCount = await page.locator('.splide__slide').count();
      should(slideCount).be.equal(1);
      await page.close();
    });

    it('should filters empty slides', async () => {
      await page.route(`${hosts.promo}/ugjArgGw/unknown/banners/mobile/homepage/banner?allPromotions=true`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            promo: [
              {
                image: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/image?meta=61e156ffb1a66b5615111f1e',
                href: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/jump?meta=61e156ffb1a66b5615111f1e',
                camp: '61e156ffb1a66b5615111f1e',
              }, {
                image: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/image?meta=621374c3c42f54da4b5536ff',
                href: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/jump?meta=621374c3c42f54da4b5536ff',
                camp: '621374c3c42f54da4b5536c6',
              },
            ],
          }),
        });
      });
      await page.route(`${hosts.promo}/61d6c677baa1676dd46bfee6/unknown/raw?meta=61e156ffb1a66b5615111f1e&`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            promo: true,
            imageType: 'image',
            camp: '61e156ffb1a66b5615111f1e',
            space: '61d6c677baa1676dd46bfee6',
            name: 'SDK campaign',
          }),
        });
      });
      await page.route(`${hosts.promo}/61d6c677baa1676dd46bfee6/unknown/raw?meta=621374c3c42f54da4b5536ff&`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            imageType: 'line',
          }),
        });
      });

      await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const slider = await luckycartSDK.getSlideShow('homepage', 'banner');
        document.querySelector('#root').append(slider);
      });
      const count = await page.locator('.splide').count();
      should(count).be.equal(1);
      const slideCount = await page.locator('.splide__slide').count();
      should(slideCount).be.equal(1);
      await page.close();
    });

    it('should get a banner click event', async () => {
      const expected = {
        image: `${hosts.promo}/61d6c677baa1676dd46bfee6/unknown/image?meta=61e156ffb1a66b5615111f1e&`,
        url: `${hosts.promo}/61d6c677baa1676dd46bfee6/unknown/jump?meta=61e156ffb1a66b5615111f1e&`,
        campaign: '61e156ffb1a66b5615111f1e',
        name: 'test',
        hasImage: true,
      };
      await page.route(`${hosts.promo}/ugjArgGw/unknown/banners/mobile/homepage/banner?allPromotions=true`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            promo: [
              {
                image: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/image?meta=61e156ffb1a66b5615111f1e',
                href: 'https://promomatching.luckycart.com/61d6c677baa1676dd46bfee6/unknown/jump?meta=61e156ffb1a66b5615111f1e',
                camp: '61e156ffb1a66b5615111f1e',
              },
            ],
          }),
        });
      });
      await page.route(`${hosts.promo}/61d6c677baa1676dd46bfee6/unknown/raw?meta=61e156ffb1a66b5615111f1e&`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            promo: true,
            imageType: 'image',
            camp: '61e156ffb1a66b5615111f1e',
            space: '61d6c677baa1676dd46bfee6',
            name: 'test',
          }),
        });
      });

      const result = await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const slider = await luckycartSDK.getSlideShow('homepage', 'banner');
        document.querySelector('#root').append(slider);
        return new Promise((resolve) => {
          slider.addEventListener('bannerClick', (event) => {
            resolve(event.detail);
          });
          document.querySelector('.splide__slide a').click();
        });
      });
      should(result).be.deepEqual(expected);
      await page.close();
    });
  });

  describe('Banner display', () => {
    it('should get a banner', async () => {
      const expected = {
        hasImage: true,
        image: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/image?meta=61e156ffb1a66b5615111f1e`,
        url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/jump`,
        campaign: '61e156ffb1a66b5615111f1e',
        name: 'SDK campaign',
        HTMLElement: {},
      };

      await page.route(`${hosts.promo}/ugjArgGw/unknown/banner/mobile/categories/banner_200?`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            image_url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/image?meta=61e156ffb1a66b5615111f1e`,
            redirect_url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/jump`,
            name: 'SDK campaign',
            campaign: '61e156ffb1a66b5615111f1e',
            space: '61d6c97f4d661e8591ebf396',
            action: {
              type: 'boutique',
              ref: '250',
            },
          }),
        });
      });

      const result = await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const bannerData = await luckycartSDK.getBannerDetails('categories', 'banner', '200');
        document.querySelector('#root').append(bannerData.HTMLElement);
        return bannerData;
      });
      should(result).be.deepEqual(expected);
      const count = await page.locator('.lc-banner').count();
      should(count).be.equal(1);
      await page.close();
    });

    it('should get a banner display event', async () => {
      const expected = {
        image: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/image?meta=61e156ffb1a66b5615111f1e`,
        url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/jump`,
        campaign: '61e156ffb1a66b5615111f1e',
        name: 'test',
        hasImage: true,
      };
      await page.route(`${hosts.promo}/ugjArgGw/unknown/banner/mobile/categories/banner_200?`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            image_url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/image?meta=61e156ffb1a66b5615111f1e`,
            redirect_url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/jump`,
            campaign: '61e156ffb1a66b5615111f1e',
            name: 'test',
          }),
        });
      });

      const result = await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const bannerData = await luckycartSDK.getBannerDetails('categories', 'banner', '200');
        return new Promise((resolve) => {
          bannerData.HTMLElement.addEventListener('bannerDisplay', (event) => {
            resolve(event.detail);
          });
          document.querySelector('#root').append(bannerData.HTMLElement);
        });
      });
      should(result).be.deepEqual(expected);
      await page.close();
    });

    it('should get a banner click event', async () => {
      const expected = {
        image: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/image?meta=61e156ffb1a66b5615111f1e`,
        url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/jump`,
        campaign: '61e156ffb1a66b5615111f1e',
        name: 'test',
        hasImage: true,
      };
      await page.route(`${hosts.promo}/ugjArgGw/unknown/banner/mobile/categories/banner_200?`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            image_url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/image?meta=61e156ffb1a66b5615111f1e`,
            redirect_url: `${hosts.promo}/61d6c97f4d661e8591ebf396/unknown/jump`,
            campaign: '61e156ffb1a66b5615111f1e',
            name: 'test',
          }),
        });
      });

      const result = await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const bannerData = await luckycartSDK.getBannerDetails('categories', 'banner', '200');
        return new Promise((resolve) => {
          bannerData.HTMLElement.addEventListener('bannerClick', (event) => {
            resolve(event.detail);
          });
          document.querySelector('#root').append(bannerData.HTMLElement);
          document.querySelector('.lc-banner a').click();
        });
      });
      should(result).be.deepEqual(expected);
      await page.close();
    });
  });

  describe('Cart send', () => {
    it('should send a cart', async () => {
      const expected = {
        ticket: 'PTUK-EUUD-GBJH-YVEB',
        image: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
        url: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
      };

      await page.route(`${hosts.api}/cart/ticket`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            desktopUrl: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
            introDesktop: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
            ticket: 'PTUK-EUUD-GBJH-YVEB',
          }),
        });
      });
      const result = await page.evaluate(async () => {
        const data = { cartId: 'test0001', customerId: 'shop010', ttc: 100 };
        return luckycartSDK.sendCart(data);
      });
      should(result).be.deepEqual(expected);
      await page.close();
    });
  });

  describe('Game Data', () => {
    it('should get existing game data', async () => {
      const expected = {
        ticket: 'PTUK-EUUD-GBJH-YVEB',
        image: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
        url: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
      };

      await page.route(`${hosts.api}/cart/ticket`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            desktopUrl: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
            introDesktop: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
            ticket: 'PTUK-EUUD-GBJH-YVEB',
          }),
        });
      });
      const result = await page.evaluate(async () => {
        const data = { cartId: 'test0001', customerId: 'shop010', ttc: 100 };
        await luckycartSDK.sendCart(data);
        return luckycartSDK.getGameData(data.cartId);
      });
      should(result).be.deepEqual(expected);
      const attemptedIn = await page.evaluate(() => luckycartSDK.attemptedIn);
      should(attemptedIn).be.equal(1);
      should(result).be.deepEqual(expected);
      await page.close();
    });
    it('should get existing game data when sendCart is done in front after a delay', async () => {
      const expected = {
        ticket: 'PTUK-EUUD-GBJH-YVEB',
        image: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
        url: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
      };

      await page.route(`${hosts.api}/cart/ticket`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            desktopUrl: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
            introDesktop: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
            ticket: 'PTUK-EUUD-GBJH-YVEB',
          }),
        });
      });
      await page.route(`${hosts.api}/ugjArgGw/game/test0001/desktop`, (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Cart not found',
          }),
        });
      });
      const result = await page.evaluate(async () => {
        const data = { cartId: 'test0001', customerId: 'shop010', ttc: 100 };
        setTimeout(() => {
          luckycartSDK.sendCart(data);
        }, 500);
        return luckycartSDK.getGameData(data.cartId);
      });
      should(result).be.deepEqual(expected);
      const attemptedIn = await page.evaluate(() => luckycartSDK.attemptedIn);
      should(attemptedIn).be.equal(2);
      await page.close();
    });

    it('should get existing game data when sendCart is done by back after a delay', async () => {
      const expected = {
        ticket: 'PTUK-EUUD-GBJH-YVEB',
        image: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
        url: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
      };

      await page.route(`${hosts.api}/ugjArgGw/game/test0001/desktop`, (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Cart not found',
          }),
        });
      });

      setTimeout(() => {
        page.route(`${hosts.api}/ugjArgGw/game/test0001/desktop`, (route) => {
          route.fulfill({
            body: JSON.stringify({
              game_url: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/url`,
              image_url: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/desktop/image`,
              ticket: 'PTUK-EUUD-GBJH-YVEB',
            }),
          });
        });
      }, 500);
      const result = await page.evaluate(async () => {
        const data = { cartId: 'test0001', customerId: 'shop010', ttc: 100 };
        return luckycartSDK.getGameData(data.cartId);
      });
      should(result).be.deepEqual(expected);
      const attemptedIn = await page.evaluate(() => luckycartSDK.attemptedIn);
      should(attemptedIn).be.equal(2);
      await page.close();
    });
  });

  describe('Game display', () => {
    it('should get the game image', async () => {
      await page.route(`${hosts.api}/cart/ticket`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            mobileUrl: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/url`,
            introMobile: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/image`,
            ticket: 'PTUK-EUUD-GBJH-YVEB',
          }),
        });
      });
      await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const data = { cartId: 'test0001', customerId: 'shop010', ttc: 100 };
        await luckycartSDK.sendCart(data);
        const image = await luckycartSDK.getGameImage(data.cartId);
        document.querySelector('#root').append(image);
      });
      const locator = page.locator('.lc-game-image');
      await locator.waitFor();
      const count = await locator.count();
      should(count).be.equal(1);
      const imageSrc = await page.locator('a.lc-game-image img').getAttribute('src');
      should(imageSrc).be.equal(`${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/image`);
      const linkHref = await page.locator('a.lc-game-image').getAttribute('href');
      should(linkHref).be.equal(`${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/url`);
      await page.close();
    });

    it('should show the game popin', async () => {
      await page.route(`${hosts.api}/cart/ticket`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            mobileUrl: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/url`,
            introMobile: `${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/image`,
            ticket: 'PTUK-EUUD-GBJH-YVEB',
          }),
        });
      });
      await page.evaluate(async () => {
        luckycartSDK.setSubset('mobile');
        const data = { cartId: 'test0001', customerId: 'shop010', ttc: 100 };
        await luckycartSDK.sendCart(data);
        await luckycartSDK.showGamePopin(data.cartId);
      });

      const modalLocator = await page.locator('.tingle-modal');
      await modalLocator.waitFor();
      const count = await modalLocator.count();
      should(count).be.equal(1);
      const imageSrc = await page.locator('.tingle-modal img').getAttribute('src');
      should(imageSrc).be.equal(`${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/image`);
      const linkHref = await page.locator('.tingle-modal a').getAttribute('href');
      should(linkHref).be.equal(`${hosts.api}/replacement/PTUK-EUUD-GBJH-YVEB/mobile/url`);
      await page.close();
    });

    it('should show the game plugin', async () => {
      await page.route(`${hosts.api}/token/plugin`, (route) => {
        route.fulfill({
          body: JSON.stringify({
            ticket: 'YAMZ-WJCL-JKME-TRVU',
          }),
        });
      });
      await page.evaluate(async () => {
        await luckycartSDK.showGamePluginV2('test0001', '#root');
      });
      const gameLocator = page.locator('iframe');
      await gameLocator.waitFor();
      const count = await gameLocator.count();
      should(count).be.equal(1);
      await page.close();
    });
  });
});
