class LuckyClient {
  static get SDKUrl() {
    return 'https://integration.luckycart.com/js-sdk/sdk/dist/luckycart.min.js';
  }

  constructor(key = 'key', secret = 'secret') {
   this.key = key;
   this.secret = secret;
   this.isLoaded = false;
  }

  /**
   * Get a data
   * @returns {string}
   */
  getData(property) {
    return dataLayer[property];
  }

  /**
   * Get the current template
   * @returns {string}
   */
  getTemplate() {
    return this.getData('page_type');
  }

  /**
   * Get the current page name
   * @returns {string}
   */
  getPageName() {
    return this.getData('page_name');
  }

  /**
   * Get the current store id
   * @returns {string}
   */
  getStoreId() {
    return this.getData('page_name');
  }

  /**
   * Get the current shop id
   * @returns {string}
   */
  getShopId() {
    return this.getData('page_boutique_id');
  }

  /**
   * Get the current category id
   * @returns {string}
   */
  getCategoryId() {
    return this.getData('page_category_id');
  }

  /**
   * Get the connected shopper id
   * @returns {string}
   */
  getUserId() {
    return this.getData('user_id');
  }

  /**
   * Get the commons banner params
   * @returns {object}
   */
  getBannerParams() {
    return { 
      store: this.getStoreId() 
    };
  }

  /**
   * Is mobile display
   * @returns {boolean}
   */
  isMobile() {
    return false;
  }

  /**
   * Load a script
   * @param {string} source 
   * @returns {Promise}
   */
  loadScript(source) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = source;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  /**
   * Return a normalized name of the current page
   * @returns {String} Current page
   */
  getNormalizedPageType(){
    switch (this.getTemplate()){
      case 'homepage': return 'homepage';
      case 'recherche': return 'search';
      case 'rayons': return 'category';
      case 'boutique': return 'shop';
      case 'promotions': return 'promotions';
      case 'confirmation': return 'payment';
    }
  }

  /**
   *  Specifics  methods
   */
  includeCSS() {
    const style = document.createElement('style');
    const css = ``;
    style.appendChild(document.createTextNode(css));
    document.head.append(style);
  }

  /**
   * Homepage
   * @returns 
   */
  async homepage() {
    const slider = await this.SDK.getSlideShow('homepage', 'banner-format', null, this.getBannerParams());
    // Append the slider
  }

  /**
   * Category page
   * @returns 
   */
  async category() {
    const categoryId = this.getCategoryId();
    if (!categoryId) {
      return;
    }
    const bannerData = await this.SDK.getBannerDetails('categories' , 'banner-format', categoryId, this.getBannerParams());
    if (!bannerData) {
      return;
    }
    // Append the banner
  }

  /**
   * promotions pages
   * @returns 
   */
  async promotions() {
    const bannerData = await this.SDK.getBannerDetails('promotions' , 'banner-format', categoryId, this.getBannerParams());
    if (!bannerData) {
      return;
    }
    // Append the banner
  }

  /**
   * Shop page
   * @returns 
   */
  async shop() {
    const shopId = this.getShopId();
    const bannerData = await this.SDK.getBannerDetails('boutiques' , 'banner-format', shopId, this.getBannerParams());
    if (!bannerData) {
      return;
    }
    // Append the banner
  }

  /**
   * Search page
   * @returns 
   */
  async search() {
    const categoryId = null; // retrieve the searched category
    if (!categoryId) {
      return;
    }
    const bannerData = await this.SDK.getBannerDetails('categories' , 'product', categoryId, this.getBannerParams());
    if (!bannerData) {
      return;
    }
    // Append the banner
  }

  /**
   * Payment page
   * @returns 
   */
  async payment() {
    await this.SDK.showGamePlugin(null, 'selector');
  }

  /**
   * Client init
   */
  async init() {
    if (this.isLoaded) {
      return;
    }
    this.isLoaded = true;

    await this.loadScript(LuckyClient.SDKUrl);
    this.SDK = new LuckyCart(this.key, this.secret);
    this.includeCSS();
    this.SDK.setTest(true);
    this.SDK.setShopper(this.getUserId());


    if (this.isMobile()) {
      this.SDK.setSubset('webmobile');
    }

    const currentPage = this.getNormalizedPageType();
    switch (currentPage) {
      case 'homepage': return this.homepage();
      case 'category': return this.category();
      case 'promotions': return this.promotions();
      case 'shop': return this.shop();
      case 'search': return this.search();
      case 'payment': return this.payment();
    }
  }
}
const luckyClient = new LuckyClient('apiKey');
luckyClient.init();