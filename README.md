# Lucky Cart SDK
## Overview
This library is an helper to connect your website to the Lucky Cart APIs.
It simplify the integration process and allow a quick setup of the Lucky Cart solution.

## Getting Started
### Installation
To use the SDK in the browser, simply add the following script tag to your HTML pages:
```html
<script src="https://integration.luckycart.com/sdk/luckycart.js"></script>
```
### Initialization
You must first instanciate the library with the permissions provided by our intetgration team:
```js
const luckycartSDK = new LuckyCart('AUTH_KEY', 'AUTH_SECRET');
```

## Usage
### Set the current shopper
If the shopper is connected on the website, you can log it in too in the SDK. Shopper Id is required to send carts information at checkout.
**Warning**: You need to have an automaton attached to the specified shopperUid.
```js
luckycartSDK.setShopper(datalayer.user_id);
```

### Set the current device
If the shopper is curently browsing the website on a mobile device, you can set it in the SDK to display mobile media.
The available entries are: desktop | mobile | webmobile
```js
luckycartSDK.setSubset('webmobile');
```

### Display banners
Banners can be displayed on a various list of pages. the SDK need the type of page the shopper is currently browsing to load the associated banners. It also need the format of the banner you want to display (header, banner, footer, etc...)
#### Exemples
Homepage:
```js
const bannerData = await luckycartSDK.getBannerDetails('homepage' , 'header');
```

Some types of pages may need to be clearly identified, categories page for exemple. You can give the page identifier to the SDK:

```js
const bannerData = await luckycartSDK.getBannerDetails('category' , 'header', '1450');
```

You can also indicate some extra parameters to allow a finest selection of which banners would be displayed on a page. For example, current shop id can be sent to select only local promotions:
```js
const bannerData = await luckycartSDK.getBannerDetails('promotion' , 'footer', null, { shopId: 1480 });
```

#### Return details
If a promotion is available for the current call, the return of the function contains the informations of the banner to display:
```js
console.log(bannerData);
{
  hasImage: true,
  image: "https://promomatching.luckycart.com/61d6c97f4d661e8591ebf396/customer1234/image",
  url: "https://promomatching.luckycart.com/61d6c97f4d661e8591ebf396/customer1234/jump",
  name: "SDK campaign",
  campaign: "61e156ffb1a66b5615111f1e",
  HTMLElement: div.lc-banner,
}
```

- hasImage: Boolean indicating if a image is available for display.
- image: the image URL to display.
- url: the URL to redirect the shopper on click on the image.
- name: name of the Lucky Cart campaign selected.
- campaign: the internal campaign identifier.
- HTMLElement: The DOM element to include on the page.

The HTMLElement is a built-in element ready to include in the page. Basicaly, you juste need to insert the element where you want it to be displayed:

```js
document.querySelector('#root').append(bannerData.HTMLElement);
```
#### Events handling
The HTMLElement includes custom events to capture user interactions with the banner. The event thrown are:
- bannerDisplay
- bannerClick

```js
const bannerData = await luckycartSDK.getBannerDetails('promotion' , 'footer',
document.querySelector('#root').append(bannerData.HTMLElement);
bannerData.HTMLElement.addEventListener('bannerDisplay', (event) => {
  myTracking('track display', event);
});
bannerData.HTMLElement.addEventListener('bannerClick', (event) => {
  myTracking('track click', event);
});
```

The event catched has a property detail where you can get the original bannerData informations.

### Send the current transaction
When the shopper does a payment, you need some data to Lucky Cart services. Then, the Lucky Cart API will analyse the transaction and will determine if a game can be generated.
A JSON must be passed to the function with all the transaction's properties.

Some are essentials:
- cart identifier
- shopper identifier
- transaction amount
- products details


```js
const data = {
  cartId: datalayer.transaction_id,
  ttc: 120,
  ht: 100,
  products: [
    {id: 12345, ttc: 12, ht: 10, qty: 1}
  ]
};
await luckycartSDK.sendCart(data);
```

### Display the games

Various display types are available:
- The game included directly to the transaction page, the shopper doesn't have to leave your site to interact with it.
- An access to play the game on a page hosted externaly.

#### Game included to the page

You can include the interactive game directly in the body of the page.
You need to give the transaction identifier to retrieve the associated games. The function also need to know where the game will be appended. A query selector is needed to append the game.

```js
luckycartSDK.showGamePlugin(data.cartId, '#luckygameContainer');
```

#### Game access via an image in a popin

The access to the game can also be done by displaying a popin which include a image linked to an external play page. The function display a popin containing an image and a link redirecting the shopper on an external play page associated to the current game.

```js
luckycartSDK.showGamePopin(data.cartId);
```

#### Game access via an image

Finally, The access to the game can also be done by directly displaying an image linked to an external play page where the integrator wants. The DOM element returned by the function contains the link to redirect the shopper on. You just need to insert the element where you want.

```js
const image = await luckycartSDK.getGameImage(data.cartId);
if (image) {
  document.querySelector('#root').append(image);
}
```

## Experience Engine Usage
### How to send events
The method `sendShopperEvent` will perform a `POST` request with an `eventName` and a payload.

#### Example of event sent:
```json
{
    "shopperId": "customer1234",
    "siteKey": "ugjArgGw",
    "eventName": "CartValidated",
    "payload": {
        "cartId": "492559",
        "customerId": "290907",
        "totaltAti": 100,
        "game": "v2",
        "products": [
            {
                "id": 12345,
                "ttc": 10,
                "qty": 10,
                "start": "2022-08-22T12:47:21.704Z"
            }
        ]
    }
}
```
The event might trigger an automaton. It will create an experience if the transition is valid.
​
### How to get experiences
The method `getShopperExperiences` will perform a `GET` request with a mandatory `experienceType`.
​
#### Example of experience to get:
```json
[
  {
    [
      {
      "key": "customer1234#ugjArgGw#game#2022-08-22",
      "data": {
          "summary": {
              "eventId": "96adb164-5aba-4a29-862c-f0f58f388c1d",
              "shopperId": "customer1234",
              "siteKey": "ugjArgGw",
              "experienceId": "c1eceba3-12c0-4c28-8c95-a033b4829bda",
              "type": "game",
              "happenedAt": "1661155541729000"
          },
          "payload": {
              "gameType": "wheel",
              "probability": 0.1,
              "prizeAmount": false
          }
        }
      }
    ]
  }
]
```

## TODOs

- Remove XPN_ from cartUID in URL to get gameV2
  - `showGamePluginXPN`