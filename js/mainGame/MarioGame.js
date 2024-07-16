function MarioGame() {
  var gameUI = GameUI.getInstance();

  var maxWidth;
  var height;
  var viewPort;
  var tileSize;
  var map;
  var originalMaps;
  var translatedDist;
  var centerPos;
  var marioInGround;
  var mario;
  var element;
  var gameSound;
  var score;

  var keys = [];
  var goombas;
  var powerUps;
  var bullets;
  var bulletFlag = false;

  var currentLevel;

  var animationID;
  var timeOutId;

  var tickCounter = 0;
  var maxTick = 25;
  var instructionTick = 0;
  var that = this;

  this.init = function (levelMaps, level) {
    height = 480;
    maxWidth = 0;
    viewPort = 1280;
    tileSize = 32;
    translatedDist = 0;
    goombas = [];
    powerUps = [];
    bullets = [];

    gameUI.setWidth(viewPort);
    gameUI.setHeight(height);
    gameUI.show();

    currentLevel = level;
    originalMaps = levelMaps;
    map = JSON.parse(levelMaps[currentLevel]);

    if (!score) {
      score = new Score();
      score.init();
    }
    score.displayScore();
    score.updateLevelNum(currentLevel);

    if (!mario) {
      mario = new Mario();
      mario.init();
    } else {
      mario.x = 10;
      mario.frame = 0;
    }
    element = new Element();
    gameSound = new GameSound();
    gameSound.init();

    that.calculateMaxWidth();
    that.bindKeyPress();
    that.startGame();
  };

  that.calculateMaxWidth = function () {
    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        if (maxWidth < map[row].length * 32) {
          maxWidth = map[column].length * 32;
        }
      }
    }
  };

  that.bindKeyPress = function () {
    var canvas = gameUI.getCanvas();

    document.body.addEventListener("keydown", function (e) {
      keys[e.keyCode] = true;
    });

    document.body.addEventListener("keyup", function (e) {
      keys[e.keyCode] = false;
    });

    canvas.addEventListener("touchstart", function (e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true;
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = true;
          keys[17] = true;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true;
        }
      }
    });

    canvas.addEventListener("touchend", function (e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX <= 640) {
          keys[39] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = false;
          keys[17] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = false;
        }
      }
    });

    canvas.addEventListener("touchmove", function (e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true;
          keys[39] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true;
          keys[37] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = true;
          keys[32] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true;
          keys[16] = false;
          keys[17] = false;
        }
      }
    });
  };

  this.startGame = function () {
    animationID = window.requestAnimationFrame(that.startGame);

    gameUI.clear(0, 0, maxWidth, height);

    if (instructionTick < 1000) {
      that.showInstructions();
      instructionTick++;
    }

    that.renderMap();

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].draw();
      powerUps[i].update();
    }

    for (var i = 0; i < bullets.length; i++) {
      bullets[i].draw();
      bullets[i].update();
    }

    for (var i = 0; i < goombas.length; i++) {
      goombas[i].draw();
      goombas[i].update();
    }

    that.checkPowerUpMarioCollision();
    that.checkBulletEnemyCollision();
    that.checkEnemyMarioCollision();

    mario.draw();
    that.updateMario();
    that.wallCollision();
    marioInGround = mario.grounded;
  };

  this.showInstructions = function () {
    gameUI.writeText(
      "Controls: Arrow keys for direction, shift to run, ctrl for bullets",
      30,
      30
    );
    gameUI.writeText(
      "Tip: Jumping while running makes you jump higher",
      30,
      60
    );
  };

  this.renderMap = function () {
    mario.grounded = false;

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].grounded = false;
    }
    for (var i = 0; i < goombas.length; i++) {
      goombas[i].grounded = false;
    }

    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        switch (map[row][column]) {
          case 1:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.platform();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 2:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.coinBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 3:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.powerUpBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 4:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.uselessBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 5:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flagPole();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            break;

          case 6: //flag
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flag();
            element.draw();
            break;

          case 7:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeLeft();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 8:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeRight();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 9:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopLeft();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 10:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopRight();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 20:
            var enemy = new Enemy();
            enemy.x = column * tileSize;
            enemy.y = row * tileSize;
            enemy.goomba();
            enemy.draw();

            goombas.push(enemy);
            map[row][column] = 0;
        }
      }
    }
  };

  this.collisionCheck = function (objA, objB) {
    var vX = objA.x + objA.width / 2 - (objB.x + objB.width / 2);
    var vY = objA.y + objA.height / 2 - (objB.y + objB.height / 2);

    var hWidths = objA.width / 2 + objB.width / 2;
    var hHeights = objA.height / 2 + objB.height / 2;
    var collisionDirection = null;

    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      var offsetX = hWidths - Math.abs(vX);
      var offsetY = hHeights - Math.abs(vY);

      if (offsetX >= offsetY) {
        if (vY > 0 && vY < 37) {
          collisionDirection = "t";
          if (objB.type != 5) {
            objA.y += offsetY;
          }
        } else if (vY < 0) {
          collisionDirection = "b";
          if (objB.type != 5) {
            objA.y -= offsetY;
          }
        }
      } else {
        if (vX > 0) {
          collisionDirection = "l";
          objA.x += offsetX;
        } else {
          collisionDirection = "r";
          objA.x -= offsetX;
        }
      }
    }
    return collisionDirection;
  };

  this.checkElementMarioCollision = function (element, row, column) {
    var collisionDirection = that.collisionCheck(mario, element);

    if (collisionDirection == "l" || collisionDirection == "r") {
      mario.velX = 0;
      mario.jumping = false;

      if (element.type == 5) {
        that.levelFinish(collisionDirection);
      }
    } else if (collisionDirection == "b") {
      if (element.type != 5) {
        mario.grounded = true;
        mario.jumping = false;
      }
    } else if (collisionDirection == "t") {
      if (element.type != 5) {
        mario.velY *= -1;
      }

      if (element.type == 3) {
        var powerUp = new PowerUp();

        if (mario.type == "small") {
          powerUp.mushroom(element.x, element.y);
          powerUps.push(powerUp);
        } else {
          powerUp.flower(element.x, element.y);
          powerUps.push(powerUp);
        }

        map[row][column] = 4;
        gameSound.play("powerUpAppear");
      }

      if (element.type == 11) {
        var powerUp = new PowerUp();
        powerUp.flower(element.x, element.y);
        powerUps.push(powerUp);

        map[row][column] = 4;
        gameSound.play("powerUpAppear");
      }

      if (element.type == 2) {
        score.coinScore++;
        score.totalScore += 100;

        score.updateCoinScore();
        score.updateTotalScore();
        map[row][column] = 4;
        gameSound.play("coin");
      }
    }
  };

  this.checkElementPowerUpCollision = function (element) {
    for (var i = 0; i < powerUps.length; i++) {
      var collisionDirection = that.collisionCheck(powerUps[i], element);

      if (collisionDirection == "l" || collisionDirection == "r") {
        powerUps[i].velX *= -1;
      } else if (collisionDirection == "b") {
        powerUps[i].grounded = true;
      }
    }
  };

  this.checkElementEnemyCollision = function (element) {
    for (var i = 0; i < goombas.length; i++) {
      if (goombas[i].state != "deadFromBullet") {
        var collisionDirection = that.collisionCheck(goombas[i], element);

        if (collisionDirection == "l" || collisionDirection == "r") {
          goombas[i].velX *= -1;
        } else if (collisionDirection == "b") {
          goombas[i].grounded = true;
        }
      }
    }
  };

  this.checkElementBulletCollision = function (element) {
    for (var i = 0; i < bullets.length; i++) {
      var collisionDirection = that.collisionCheck(bullets[i], element);

      if (collisionDirection == "b") {
        bullets[i].grounded = true;
      } else if (
        collisionDirection == "t" ||
        collisionDirection == "l" ||
        collisionDirection == "r"
      ) {
        bullets.splice(i, 1);
      }
    }
  };

  this.checkPowerUpMarioCollision = function () {
    for (var i = 0; i < powerUps.length; i++) {
      var collWithMario = that.collisionCheck(powerUps[i], mario);
      if (collWithMario) {
        if (powerUps[i].type == 30 && mario.type == "small") {
          mario.type = "big";
        } else if (powerUps[i].type == 31) {
          mario.type = "fire";
        }
        powerUps.splice(i, 1);

        score.totalScore += 1000;
        score.updateTotalScore();
        gameSound.play("powerUp");
      }
    }
  };

  this.checkEnemyMarioCollision = function () {
    for (var i = 0; i < goombas.length; i++) {
      if (
        !mario.invulnerable &&
        goombas[i].state != "dead" &&
        goombas[i].state != "deadFromBullet"
      ) {
        var collWithMario = that.collisionCheck(goombas[i], mario);

        if (collWithMario == "t") {
          goombas[i].state = "dead";

          mario.velY = -mario.speed;

          score.totalScore += 1000;
          score.updateTotalScore();

          gameSound.play("killEnemy");
        } else if (
          collWithMario == "r" ||
          collWithMario == "l" ||
          collWithMario == "b"
        ) {
          goombas[i].velX *= -1;

          if (mario.type == "big") {
            mario.type = "small";
            mario.invulnerable = true;
            collWithMario = undefined;

            gameSound.play("powerDown");

            setTimeout(function () {
              mario.invulnerable = false;
            }, 1000);
          } else if (mario.type == "fire") {
            mario.type = "big";
            mario.invulnerable = true;

            collWithMario = undefined;

            gameSound.play("powerDown");

            setTimeout(function () {
              mario.invulnerable = false;
            }, 1000);
          } else if (mario.type == "small") {
            that.pauseGame();

            mario.frame = 13;
            collWithMario = undefined;

            score.lifeCount--;
            score.updateLifeCount();

            gameSound.play("marioDie");

            timeOutId = setTimeout(function () {
              if (score.lifeCount == 0) {
                that.gameOver();
              } else {
                that.resetGame();
              }
            }, 3000);
            break;
          }
        }
      }
    }
  };

  this.checkBulletEnemyCollision = function () {
    for (var i = 0; i < goombas.length; i++) {
      for (var j = 0; j < bullets.length; j++) {
        if (goombas[i] && goombas[i].state != "dead") {
          var collWithBullet = that.collisionCheck(goombas[i], bullets[j]);
        }

        if (collWithBullet) {
          bullets[j] = null;
          bullets.splice(j, 1);

          goombas[i].state = "deadFromBullet";

          score.totalScore += 1000;
          score.updateTotalScore();

          gameSound.play("killEnemy");
        }
      }
    }
  };

  this.wallCollision = function () {
    if (mario.x >= maxWidth - mario.width) {
      mario.x = maxWidth - mario.width;
    } else if (mario.x <= translatedDist) {
      mario.x = translatedDist + 1;
    }

    if (mario.y >= height) {
      that.pauseGame();

      gameSound.play("marioDie");

      score.lifeCount--;
      score.updateLifeCount();

      timeOutId = setTimeout(function () {
        if (score.lifeCount == 0) {
          that.gameOver();
        } else {
          that.resetGame();
        }
      }, 3000);
    }
  };

  this.updateMario = function () {
    var friction = 0.9;
    var gravity = 0.2;

    mario.checkMarioType();

    if (keys[38] || keys[32]) {
      if (!mario.jumping && mario.grounded) {
        mario.jumping = true;
        mario.grounded = false;
        mario.velY = -(mario.speed / 2 + 5.5);

        if (mario.frame == 0 || mario.frame == 1) {
          mario.frame = 3;
        } else if (mario.frame == 8 || mario.frame == 9) {
          mario.frame = 2;
        }

        gameSound.play("jump");
      }
    }

    if (keys[39]) {
      that.checkMarioPos();

      if (mario.velX < mario.speed) {
        mario.velX++;
      }

      if (!mario.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / mario.speed) {
          tickCounter = 0;

          if (mario.frame != 1) {
            mario.frame = 1;
          } else {
            mario.frame = 0;
          }
        }
      }
    }

    if (keys[37]) {
      if (mario.velX > -mario.speed) {
        mario.velX--;
      }

      if (!mario.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / mario.speed) {
          tickCounter = 0;

          if (mario.frame != 9) {
            mario.frame = 9;
          } else {
            mario.frame = 8;
          }
        }
      }
    }

    if (keys[16]) {
      mario.speed = 4.5;
    } else {
      mario.speed = 3;
    }

    if (keys[17] && mario.type == "fire") {
      if (!bulletFlag) {
        bulletFlag = true;
        var bullet = new Bullet();
        if (mario.frame == 9 || mario.frame == 8 || mario.frame == 2) {
          var direction = -1;
        } else {
          var direction = 1;
        }
        bullet.init(mario.x, mario.y, direction);
        bullets.push(bullet);

        gameSound.play("bullet");

        setTimeout(function () {
          bulletFlag = false;
        }, 500);
      }
    }

    if (mario.velX > 0 && mario.velX < 1 && !mario.jumping) {
      mario.frame = 0;
    } else if (mario.velX > -1 && mario.velX < 0 && !mario.jumping) {
      mario.frame = 8;
    }

    if (mario.grounded) {
      mario.velY = 0;

      if (mario.frame == 3) {
        mario.frame = 0;
      } else if (mario.frame == 2) {
        mario.frame = 8;
      }
    }

    mario.velX *= friction;
    mario.velY += gravity;

    mario.x += mario.velX;
    mario.y += mario.velY;
  };

  this.checkMarioPos = function () {
    centerPos = translatedDist + viewPort / 2;

    if (mario.x > centerPos && centerPos + viewPort / 2 < maxWidth) {
      gameUI.scrollWindow(-mario.speed, 0);
      translatedDist += mario.speed;
    }
  };

  this.levelFinish = function (collisionDirection) {
    if (collisionDirection == "r") {
      mario.x += 10;
      mario.velY = 2;
      mario.frame = 11;
    } else if (collisionDirection == "l") {
      mario.x -= 32;
      mario.velY = 2;
      mario.frame = 10;
    }

    if (marioInGround) {
      mario.x += 20;
      mario.frame = 10;
      tickCounter += 1;
      if (tickCounter > maxTick) {
        that.pauseGame();

        mario.x += 10;
        tickCounter = 0;
        mario.frame = 12;

        gameSound.play("stageClear");

        timeOutId = setTimeout(function () {
          currentLevel++;
          if (originalMaps[currentLevel]) {
            that.init(originalMaps, currentLevel);
            score.updateLevelNum(currentLevel);
          } else {
            that.gameOver();
          }
        }, 5000);
      }
    }
  };

  this.pauseGame = function () {
    window.cancelAnimationFrame(animationID);
  };

  this.gameOver = function () {
    score.gameOverView();
    gameUI.makeBox(0, 0, maxWidth, height);
    gameUI.writeText("Game Over", centerPos - 80, height - 300);
    gameUI.writeText("Thanks For Playing", centerPos - 122, height / 2);
  };

  this.resetGame = function () {
    that.clearInstances();
    that.init(originalMaps, currentLevel);
  };

  this.clearInstances = function () {
    mario = null;
    element = null;
    gameSound = null;

    goombas = [];
    bullets = [];
    powerUps = [];
  };

  this.clearTimeOut = function () {
    clearTimeout(timeOutId);
  };

  this.removeGameScreen = function () {
    gameUI.hide();

    if (score) {
      score.hideScore();
    }
  };

  this.showGameScreen = function () {
    gameUI.show();
  };
}
