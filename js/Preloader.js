function Preloader() {
  var view = View.getInstance();

  var loadingPercentage;

  var imageSources;
  var soundSources;

  var that = this;

  this.init = function () {
    loadingPercentage = view.create("div");

    view.addClass(loadingPercentage, "loading-percentage");
    view.setHTML(loadingPercentage, "0%");
    view.appendToBody(loadingPercentage);

    imageSources = {
      1: "images/back-btn.png",
      2: "images/bg.png",
      3: "images/bullet.png",
      4: "images/coin.png",
      5: "images/elements.png",
      6: "images/enemies.png",
      7: "images/flag-pole.png",
      8: "images/flag.png",
      9: "images/start-screen.png",
      10: "images/grid.png",
      11: "images/lvl-size.png",
      12: "images/mario-head.png",
      13: "images/mario-sprites.png",
      14: "images/powerups.png",
      15: "images/slider-left.png",
      16: "images/slider-right.png",
      17: "images/start-btn.png",
    };

    that.loadImages(imageSources);
  };

  this.loadImages = function (imageSources) {
    var images = {};
    var loadedImages = 0;
    var totalImages = 0;

    for (var key in imageSources) {
      totalImages++;
    }

    for (var key in imageSources) {
      images[key] = new Image();
      images[key].src = imageSources[key];

      images[key].onload = function () {
        loadedImages++;
        percentage = Math.floor((loadedImages * 100) / totalImages);

        view.setHTML(loadingPercentage, percentage + "%");

        if (loadedImages >= totalImages) {
          view.removeFromBody(loadingPercentage);
          that.initMainApp();
        }
      };
    }
  };

  this.initMainApp = function () {
    var marioMakerInstance = MarioMaker.getInstance();
    marioMakerInstance.init();
  };
}

window.onload = function () {
  var preloader = new Preloader();
  preloader.init();
};
