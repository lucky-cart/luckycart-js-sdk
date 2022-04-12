class LuckyCart {
  /**
  * SDK Configuration object
  * @typedef {object} SDKConfiguration
  * @property {string} subset The initial subset
  * @property {boolean} imagesHost Image server host
  * @property {boolean} apiHost API server host
  * @property {boolean} experienceHost Experience server host
  */
  /**
  * GameData object
  * @typedef {object} GameData
  * @property {string} ticket Ticket code
  * @property {string} image Image Url
  * @property {string} url Link url
  * @property {string} [script] Script to append to load the V1 game
  */
  /**
  * BannerDetails object
  * @typedef {object} BannerDetails
  * @property {boolean} hasImage Is an image available ?
  * @property {string} image Image Url
  * @property {string} url Link url
  * @property {string} campaign Promotionnal campaign internal identifier
  * @property {string} name Promotionnal campaign name
  * @property {HTMLElement} [HTMLElement] Banner to append
  */
  /**
  * SliderOptions object
  * @typedef {object} SliderOptions
  * @property {number} interval Interval in ms
  * @property {boolean} arrows Display the navigation arrows
  * @property {boolean} pagination Display the pagination bullets
  */

  // CONSTANTS
  static get defaultCustomer() {
    return 'unknown';
  }

  static get defaultSubset() {
    return 'desktop';
  }

  static get authorizedSubsets() {
    return [ 'desktop', 'mobile', 'webmobile' ];
  }

  static get bannerClass() {
    return 'lc-banner';
  }

  static get gameDataInterval() {
    return 1000;
  }

  static get gameDataMaxAttempt() {
    return 5;
  }

  static get librariesRoot() {
    return 'https://integration.luckycart.com/js-sdk/sdk/assets';
  }

  static get defaultTTL() {
    return 60 * 30; // 30 minutes
  }

  /**
  * Constructor
  * @param {string} key Auth key
  * @param {string} secret Auth Secret
  * @param {SDKConfiguration} options SDK options
  */
  constructor(key, secret, options = {}) {
    if (!key) {
      throw new Error('Missing auth key parameter');
    }
    if (typeof options !== 'object') {
      throw new Error('Options must be an object');
    }
    this.auth = { key, secret };
    this.options = options;
    if (options && options.subset) {
      this.setSubset(options.subset);
    }
    this.loadLibrary('luckycart', 'css');
  }

  getImagesHost() {
    return this.options.imagesHost || 'https://promomatching.luckycart.com';
  }

  getApiHost() {
    return this.options.apiHost || 'https://api.luckycart.com';
  }

  getExperienceHost() {
    return this.options.experienceHost || 'https://experiences.luckycart.com';
  }

  /**
   * Return the current subset
   * @returns {string} Current subset
   */
  getSubset() {
    return this.subset || LuckyCart.defaultSubset;
  }

  /**
   * Set the current subset
   * @param {('desktop'|'mobile'|'webmobile')} subset Subset Identifier
   */
  setSubset(subset) {
    if (!LuckyCart.authorizedSubsets.includes(subset)) {
      throw new Error(`Subset "${subset}" is not valid, should be: [${LuckyCart.authorizedSubsets.join('|')}]`);
    }
    this.subset = subset;
  }

  /**
   * Return the device according to the current subset
   * @returns {string} Device
   */
  getDevice() {
    return this.getSubset() === 'desktop' ? 'desktop' : 'mobile';
  }

  /**
   * Return the current shopper id, if not set it return the default identifier
   * @returns {string} Shopper id
   */
  getShopper() {
    return this.shopper || LuckyCart.defaultCustomer;
  }

  /**
   * Set the current shopper id
   * @param {string} shopperId Shopper identifier
   */
  setShopper(shopperId) {
    this.shopper = shopperId;
  }

  /**
   * return the base URL for banners requests
   * @params {boolean} getAllPromotions Return the informations of all the promotions instead of the first
   * @returns {string} Banner details URL
   */
  getBannersBaseUrl(getAllPromotions = false) {
    const route = getAllPromotions ? 'banners' : 'banner';
    return `${this.getImagesHost()}/${this.auth.key}/${this.getShopper()}/${route}/${this.getSubset()}`;
  }

  /**
   * Set value from localstorage with TTL
   *
   * @param {string} key Local storage key
   * @param {*} value Value to store
   * @param {number} ttl TTL in seconds
   */
  storeValueWithExpiry(key, value, ttl = LuckyCart.defaultTTL) {
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + (ttl * 1000),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Get value from localstorage with TTL
   *
   * @param {string} key Local storage key
   * @returns {undefined|*}
   */
  getStoredValue(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return undefined;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (item.expiry && now.getTime() < item.expiry) {
      return item.value;
    }

    localStorage.removeItem(key);
    return undefined;
  }

  /**
   * Activate or deactivate the test mode (verbose logs)
   *
   * @param {boolean} value Value
   * @param {number} ttl TTL in seconds
   */
  setTest(value = true, ttl = undefined) {
    this.storeValueWithExpiry('lc_test', value, ttl);
  }

  /**
   * Get test mode
   *
   * @return {boolean}
   */
  isTest() {
    return this.getStoredValue('lc_test') === true;
  }

  /**
   * Activate or deactivate the test mode (verbose logs)
   *
   * @param {boolean} value Value
   * @param {number} ttl TTL in seconds
   */
  setIntegrationMode(value = true, ttl = undefined) {
    this.storeValueWithExpiry('lc_integration', value, ttl);
    this.storeValueWithExpiry('lc_test', value, ttl);
  }

  /**
   * Is integration mode
   *
   * @return {boolean}
   */
  isIntegrationMode() {
    return this.getStoredValue('lc_integration') === true;
  }

  /**
   * Log in color !
   * @param {string} str Text to log
   */
  clog(str, color = '#12a0c5') {
    console.log(`%c${str}`, `color: ${color}`);
  }

  /**
   * Log an error (wihtout throwing)
   * @param {string} str Text to log
   */
  logError(str) {
    this.clog(str, 'red');
  }

  /**
   * Log to console only when test mode is activated
   * @param args
   */
  log(...args) {
    if (this.isTest()) {
      if (!args[1]) {
        return this.clog(args[0]);
      }
      return console.log.apply(this, args);
    }
    return null;
  }

  /**
   * Sign the request data to Lucky Cart API
   * @param {string} text Text to hash
   * @returns {string} Signature
   */
  async signData(text) {
    await this.loadLibrary('hash', 'js');
    return CryptoJS.HmacSHA256(text, this.auth.secret);
  }

  /**
   * Create a string URL params from an object
   * @param {object} options Object to format
   * @returns {string} Url formatted string
   */
  formatURLParams(options) {
    return Object.keys(options).map((key) => {
      const value = options[key];
      return `${key}=${value}`;
    }).join('&');
  }

  /**
   * Load an external library
   * @params {string} name Library name
   * @params {string} [type] Force the load of only the typed element
   * @returns {Promise}
   */
  loadLibrary(name, type) {
    if (typeof document === 'undefined') {
      return null;
    }
    const id = `LC_library_${name}`;
    if (document.getElementById(id)) {
      return null;
    }
    const head = document.getElementsByTagName('HEAD')[0];

    if (!type || type === 'css') {
      const libCSS = document.createElement('link');
      libCSS.rel = 'stylesheet';
      libCSS.href = `${LuckyCart.librariesRoot}/${name}.min.css`;
      head.append(libCSS);
    }

    if (!type || type === 'js') {
      const libJS = document.createElement('script');
      libJS.id = id;
      libJS.src = `${LuckyCart.librariesRoot}/${name}.min.js`;
      head.append(libJS);
      return new Promise((resolve) => {
        libJS.addEventListener('load', resolve);
      });
    }
    return null;
  }

  /**
   * Open a modal
   * @param {string} content Content to display
   */
  async openModal(content) {
    await this.loadLibrary('tingle');
    const elem = document.querySelector('.tingle-modal');
    if (elem) {
      elem.parentNode.removeChild(elem);
    }
    // eslint-disable-next-line new-cap
    const modal = new tingle.modal();
    modal.setContent(content);
    modal.open();
    const button = document.querySelector('.tingle-modal__close');
    const modalElement = document.querySelector('.tingle-modal-box');
    modalElement.appendChild(button);
  }

  /**
   * Set-up the events dispatch mechanism
   * @param {HTMLElement} parent Emitter of the events
   * @param {HTMLElement} link Link HTMLElement
   * @param {HTMLElement} image Image HTMLElement
   * @param {object} eventDetails Details of the emitted event
   */
  initEventsDispatch(parent, link, image, eventDetails) {
    if (typeof IntersectionObserver !== 'undefined') {
      const displayObserver = new IntersectionObserver(((entries) => {
        if (!image.displayed && entries[0].isIntersecting === true) {
          // eslint-disable-next-line no-param-reassign
          image.displayed = true;
          const event = new CustomEvent('bannerDisplay', { detail: eventDetails });
          parent.dispatchEvent(event);
        }
      }), { threshold: [ 0 ] });
      displayObserver.observe(image);
    }

    link.addEventListener('click', () => {
      const event = new CustomEvent('bannerClick', { detail: eventDetails });
      parent.dispatchEvent(event);
    });
  }

  /**
   * Get banner data and create an html banner element
   * @param {object} bannerDetails Details of the banner
   * @returns {HTMLElement} HTML banner element
   */
  createBanner(bannerDetails) {
    const banner = document.createElement('div');
    banner.className = LuckyCart.bannerClass;

    const link = document.createElement('a');
    link.href = bannerDetails.url;

    const img = new Image();
    img.src = bannerDetails.image;

    link.append(img);
    banner.append(link);

    this.initEventsDispatch(banner, link, img, bannerDetails);
    return banner;
  }

  /**
   * Make a request to Lucky Cart Banner API
   * @param {string} pageType Type of the current page
   * @param {string} format Format of the banner
   * @param {string} pageId Identifier of the current page
   * @param {object} options Options
   * @returns {Promise<object>} Api response
   */
  async requestBannerAPI(pageType, format, pageId, options = {}) {
    const urlParams = this.formatURLParams(options);
    const reference = pageId ? `_${pageId}` : '';
    const url = `${this.getBannersBaseUrl(options.allPromotions)}/${pageType}/${format}${reference}?${urlParams}`;
    const result = await fetch(url);
    const response = await result.json();
    if (result.status >= 400) {
      this.logError(`requestBannerAPI: ${response.message}`);
      return null;
    }
    return response;
  }

  /**
   * Get the details for a banner
   * @param {string} pageType Type of the current page
   * @param {string} format Format of the banner
   * @param {string} pageId Identifier of the current page
   * @param {object} options External options
   * @returns {Promise<BannerDetails>} Banner details
   */
  async getBannerDetails(pageType, format, pageId, options = {}) {
    this.log(`getBannerDetails: fetching pageType(${pageType}) - format(${format}) - pageId(${pageId})`);
    // delete allPromotions flag to constraint the function to a single banner
    // eslint-disable-next-line no-param-reassign
    delete options.allPromotions;
    const response = await this.requestBannerAPI(pageType, format, pageId, options);
    if (!(response && response.image_url)) {
      return null;
    }
    this.log(`getBannerDetails: Image for ${response.name} found`);
    const data = {
      hasImage: true,
      image: response.image_url,
      url: response.redirect_url,
      campaign: response.campaign,
      name: response.name,
    };
    return {
      ...data,
      HTMLElement: this.createBanner(data),
    };
  }

  /**
   * Retrieve all the promotions details for a banner
   * @param {string} pageType Type of the current page
   * @param {string} format Format of the banner
   * @param {string} pageId Identifier of the current page
   * @param {object} options External options
   * @returns {Promise>[BannerDetails]>} Promotions details
   */
  async getPromotionList(pageType, format, pageId, options = {}) {
    const rawPromotions = await this.requestBannerAPI(pageType, format, pageId, { ...options, allPromotions: true });
    if (!(rawPromotions && rawPromotions.promo.length)) {
      return [];
    }
    const promotions = [];
    const urlParams = this.formatURLParams(options);
    await Promise.all(rawPromotions.promo.map(async (promo) => {
      const imageUrl = `${promo.image}&${urlParams}`;
      const rawUrl = imageUrl.replace('/image?', '/raw?').replace('/promo?', '/raw?');
      const result = await fetch(rawUrl);
      const response = await result.json();
      if (response.imageType === 'image') {
        promotions.push({
          hasImage: true,
          image: imageUrl,
          url: `${promo.href}&${urlParams}`,
          name: response.name,
          campaign: response.camp,
        });
      }
    }));
    return promotions;
  }

  /**
   * Get a slider for a banner
   * @param {string} pageType Type of the current page
   * @param {string} format Format of the banner
   * @param {string} pageId Identifier of the current page
   * @param {SliderOptions} sliderOptions Slider options
   * @param {object} options External options
   * @returns {Promise<HTMLElement>} Slider HTMLElement
   */
  async getSlideShow(pageType, format, pageId, sliderOptions = {}, options = {}) {
    this.log(`getSlideShow: fetching pageType(${pageType}) - format(${format}) - pageId(${pageId})`);
    const promotions = await this.getPromotionList(pageType, format, pageId, options);
    if (promotions.length === 0) {
      return null;
    }

    const slider = document.createElement('div');
    slider.className = 'lc-slide splide';
    const track = document.createElement('div');
    track.className = 'splide__track';
    slider.append(track);
    const list = document.createElement('ul');
    list.className = 'splide__list';
    track.append(list);

    promotions.forEach((promo) => {
      const slide = document.createElement('li');
      slide.className = 'splide__slide';
      const link = document.createElement('a');
      link.href = promo.url;
      const image = document.createElement('img');
      image.setAttribute('data-splide-lazy', promo.image);
      link.append(image);
      slide.append(link);
      list.append(slide);
      this.initEventsDispatch(slider, link, image, promo);
    });

    await this.loadLibrary('splide');
    new Splide(slider, {
      rewind: true,
      autoplay: true,
      interval: sliderOptions.interval !== undefined ? sliderOptions.interval : 8000,
      arrows: sliderOptions.arrows !== undefined ? sliderOptions.arrows : false,
      pagination: sliderOptions.pagination !== undefined ? sliderOptions.pagination : false,
      lazyLoad: 'nearby',
    }).mount();
    return slider;
  }

  /**
   * Make a request to Lucky Cart API
   * @param {string} route Route to load
   * @param {object} body Body of the request
   * @param {boolean} needSign Does a signature of the request is required ?
   * @returns {Promise<object>} Api response
   */
  async requestAPI(route, body, needSign = false) {
    let requestOptions = null;
    const url = `${this.getApiHost()}/${route}`;
    if (body) {
      let data = body;
      if (needSign === true) {
        const ts = Math.round((new Date()).getTime() / 1000).toString();
        const signed = await this.signData(ts);
        data = {
          ...body,
          auth_ts: ts,
          auth_key: this.auth.key,
          auth_v: '2.0',
          auth_sign: signed.toString(),
        };
      }
      requestOptions = {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
    return fetch(url, requestOptions)
      .then((response) => response.json())
      .then((response) => {
        if (response.status >= 400) {
          throw new Error(response.error);
        }
        return response;
      });
  }

  /**
   * Send the cart data to the Lucky Cart API
   * @param {object} data JSON data of the transaction
   * @returns {Promise<object>} Transaction result data
   */
  async sendCart(data) {
    // eslint-disable-next-line no-param-reassign
    data.customerId = this.getShopper();
    this.log('sendCart: sending data');
    this.log('Cart data', data);
    const response = await this.requestAPI('cart/ticket', data, true)
      .catch((err) => {
        this.logError(`sendCart: ${err.message}`);
      });
    if (!response) {
      return null;
    }
    const device = this.getDevice();
    const gameData = {
      ticket: response.ticket,
      image: response[`intro${device.charAt(0).toUpperCase() + device.slice(1)}`],
      url: response[`${device}Url`],
    };
    return gameData;
  }

  /**
   * Retrieve the current game data
   * If receiving a 'cart not found' error, retry the request until the attempts count reach the max limit
   * @param {string} cartId Identifier of the transaction
   * @param {boolean} [useDevice=false] Does it need the device result ?
   * @param {boolean} [retry=false] It is a retrying request ?
   * @returns {Promise<GameData>} Game data
   */
  async getGameData(cartId, useDevice = false, retry = false) {
    if (retry === false) {
      if (this.attempt) {
        throw new Error('GameData are already loading');
      } else {
        this.attempt = 1;
      }
    }
    if (this.attempt > LuckyCart.gameDataMaxAttempt) {
      this.attempt = 0;
      this.logError(`getGameData: Cart ${cartId} not found`);
      return null;
    }
    this.log(`getGameData: fetching data for cart '${cartId}'`);
    const device = this.getDevice();

    if (this.gameData) {
      this.attemptedIn = this.attempt;
      this.attempt = 0;
      return this.gameData;
    }

    let url = `${this.auth.key}/game/${cartId}`;
    if (!cartId) {
      url = `${this.auth.key}/game/cust/${this.getShopper()}`;
    }
    if (!useDevice) {
      url += `/${device}`;
    }
    // request gamedata with retry process enabled
    const response = await this.requestAPI(url)
      .catch((err) => ({ error: err.message }));
    if (response.error === 'Cart not found') {
      this.log(`getGameData: cart '${cartId}' not found, retrying in ${LuckyCart.gameDataInterval}ms (attempt #${this.attempt})`);
      return new Promise((resolve) => {
        setTimeout(async () => {
          this.attempt += 1;
          const gameData = await this.getGameData(cartId, useDevice, true);
          resolve(gameData);
        }, LuckyCart.gameDataInterval);
      });
    }
    const result = {
      ticket: response.ticket,
      image: response.image_url || response[`intro${device.charAt(0).toUpperCase() + device.slice(1)}`],
      url: response.game_url || response[`${device}Url`],
      cart: response.cart,
    };
    if (response.script) {
      result.script = response.script;
    }
    this.attemptedIn = this.attempt;
    this.attempt = 0;
    this.gameData = result;
    return result;
  }

  /**
   * Show the access image to redirect the shopper to the play page
   * @param {string} cartId Identifier of the transaction
   * @returns {Promise<HTMLElement>} Link HTMLElement with image embedded
   */
  async getGameImage(cartId) {
    let { gameData } = this;
    if (!this.gameData) {
      gameData = await this.getGameData(cartId);
    }
    if (!(gameData && gameData.ticket)) {
      return null;
    }
    if (!gameData.image) {
      this.log('getGameImage: no image configured');
      return null;
    }
    const link = document.createElement('a');
    link.href = gameData.url;
    link.target = '_blank';
    link.className = 'lc-game-image';
    const img = new Image();
    img.src = gameData.image;
    link.append(img);
    return link;
  }

  /**
   * Show the access popin to redirect the shopper to the play page
   * @param {string} cartId Identifier of the transaction
   */
  async showGamePopin(cartId) {
    const image = await this.getGameImage(cartId);
    if (image) {
      this.openModal(image);
    }
  }

  /**
   * Show the game plugin directly in the current page
   * @param {string} cartId Identifier of the transaction
   * @param {string} containerSelector Container identifier query
   */
  async showGamePlugin(cartId, containerSelector) {
    let { gameData } = this;
    if (!(gameData && gameData.script)) {
      this.gameData = null;
      gameData = await this.getGameData(cartId, true);
    }
    if (!(gameData && gameData.script)) {
      this.log('showGamePlugin: no game available');
      return null;
    }
    const container = document.querySelector(containerSelector);
    if (containerSelector && !container) {
      throw new Error(`${containerSelector} element not found`);
    }
    const luckygame = document.createElement('div');
    luckygame.id = 'luckygame';
    container.append(luckygame);
    gameData.script = gameData.script.replace(/<[^<>]+>/g, '');
    const script = document.createElement('script');
    script.innerHTML += gameData.script;
    document.body.appendChild(script);
    return gameData;
  }

  /**
   * Show the game (V2) plugin directly in the current page
   * @param {string} cartId Identifier of the transaction
   * @returns {Promise<HTMLElement>} Slider HTMLElement
   */
  async showGamePluginV2(cartId) {
    let { gameData } = this;
    if (!(gameData && gameData.ticket)) {
      this.gameData = null;
      gameData = await this.getGameData(cartId, true);
    }
    if (!(gameData && gameData.ticket)) {
      this.log('showGamePlugin: no game available');
      return null;
    }

    const luckygame = document.createElement('div');
    luckygame.id = 'luckygame-v2';

    const iframeResizer = document.createElement('div');
    iframeResizer.className = 'lc-iframe-resizer';
    luckygame.append(iframeResizer);

    const iframe = document.createElement('iframe');
    iframe.className = 'lc-iframe';
    iframe.src = `${this.getExperienceHost()}/?siteKey=${this.auth.key}&customerUid=${this.getShopper()}&cartUid=${gameData.cart}`;
    iframeResizer.append(iframe);

    return {
      ...gameData,
      HTMLElement: luckygame,
    };
  }
}

if (typeof window === 'undefined') {
  global.LuckyCart = LuckyCart;
}
