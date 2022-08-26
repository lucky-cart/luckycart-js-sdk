(function includeCSS() {
  const style = document.createElement('style');
  const css = `
  .lc-banner img {
    border: none;
    width: 100%;
    display: block;
    margin: 0;
  }
  
  .splide__slide img {
    border: none;
    width: 100%;
    height: auto;
  }
  
  .lc-game-image img {
    margin: 10px;
    border: none;
    display: inline-block;
  }
  .tingle-modal .lc-game-image img {
    display: block;
    margin: auto;
    max-width: 100%;
  }
  
  #luckygame{
    margin: 10px auto;
    padding: 0px 20px;
  }
  
  #luckygame-v2{
    max-width: 480px;
    margin: 10px auto;
    padding: 0px 20px;
  }
  
  .lc-iframe-resizer{
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 100%;
    text-align: center;
  }
  
  .lc-iframe {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  
  .tingle-modal #luckygame-v2 {
    min-width: 480px;
    margin: 0;
    padding: 0;
  }
  
  div.tingle-modal-box {
    background: transparent;
  }
  
  @media (max-width :540px){
    .tingle-modal #luckygame-v2 {
      min-width: auto;
    }
    div.tingle-modal-box__content {
      overflow-y: hidden;
    }
    button.tingle-modal__close {
      top: -1.5rem;
      left: auto;
      right: 1.5rem;
      width: 25px;
      height: 25px;
    }
    span.tingle-modal__closeLabel {
      display: none;
    }
    span.tingle-modal__closeIcon {
      display: initial;
      vertical-align: initial;
    }
  }
  `;
  style.appendChild(document.createTextNode(css));
  document.head.append(style);
})();
