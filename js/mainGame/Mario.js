function Mario() {
  var gameUI = GameUI.getInstance();

  this.type = "small";
  this.x;
  this.y;
  this.width = 32;
  this.height = 44;
  this.speed = 3;
  this.velX = 0;
  this.velY = 0;
  this.jumping = false;
  this.grounded = false;
  this.invulnerable = false;
  this.sX = 0;
  this.sY = 4;
  this.frame = 0;

  var that = this;

  this.init = function () {
    that.x = 10;
    that.y = gameUI.getHeight() - 40 - 40;

    marioSprite = new Image();
    marioSprite.src = "images/mario-sprites.png";
  };

  this.draw = function () {
    that.sX = that.width * that.frame;
    gameUI.draw(
      marioSprite,
      that.sX,
      that.sY,
      that.width,
      that.height,
      that.x,
      that.y,
      that.width,
      that.height
    );
  };

  this.checkMarioType = function () {
    if (that.type == "big") {
      that.height = 60;

      if (that.invulnerable) {
        that.sY = 276;
      } else {
        that.sY = 90;
      }
    } else if (that.type == "small") {
      that.height = 44;

      if (that.invulnerable) {
        that.sY = 222;
      } else {
        that.sY = 4;
      }
    } else if (that.type == "fire") {
      that.height = 60;

      that.sY = 150;
    }
  };

  this.resetPos = function () {
    that.x = canvas.width / 10;
    that.y = canvas.height - 40;
    that.frame = 0;
  };
}
