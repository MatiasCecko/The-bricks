function drawIt() {
  var x;
  var y;
  var dx;
  var dx;
  var dy;
  var ballAngle = 0;
  var r = 15;
  var scorePopups = [];

  function drawScorePopups() {
    const now = Date.now();
    scorePopups = scorePopups.filter(p => now - p.time < 600);

    for (const popup of scorePopups) {
      const elapsed = now - popup.time;
      const opacity = 1 - elapsed / 600;
      const yOffset = -elapsed / 15;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "black";
      ctx.font = "bold 16px Arial";
      ctx.fillText("+" + popup.points, popup.x, popup.y + yOffset);
      ctx.restore();
    }
  }



  function setBallSpeed() {
    const level = $("#difficulty").val();
    if (level === "easy") {
      dx = 2;
      dy = 3;
    } else if (level === "medium") {
      dx = 4;
      dy = 6;
    } else if (level === "hard") {
      dx = 8;
      dy = 10;
    }
  }

  var dy;
  var WIDTH;
  var HEIGHT;
  var r = 16;
  var ctx;
  var paused;
  var bestScore = 0;

  function init() {
    ctx = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    setBallSpeed();
    x = HEIGHT / 2;
    y = WIDTH - 15;
    sekunde = 0;
    izpisTimer = "00:00";
    tocke = 0;
    paused = false;
    $("#tocke").html(tocke);
    start2();
    bestScore = localStorage.getItem('bestScore') || 0;
    $("#bestScore").html(bestScore);
  }

  function start2() {
    intTimer = setInterval(timer, 1000);
    intervalId = setInterval(draw, 10);
  }
  var ballImg = new Image();
  ballImg.src = "slike/ball.png";
  function circle(x, y, r) {
    ctx.drawImage(ballImg, x - r, y - r, r * 2, r * 2)
  }

  function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
  }

  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }
  //END LIBRARY CODE

  init();
  var paddlex;
  var paddleh;
  var paddlew;

  var rowcolors = ["#fff", "#fff", "#fff", "#fff", "#fff"];
  var paddlecolor = "#fff";
  var ballcolor = "#ff0";

  function init_paddle() {
    paddlew = 110;
    paddlex = WIDTH / 2 - paddlew / 2;  // This centers the paddle properly
    paddleh = 10;
  }
  var rowheight;
  var colwidth;
  var row;
  var col;

  function draw() {
    clear();
    ctx.fillStyle = ballcolor;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-ballAngle);
    ctx.drawImage(ballImg, -r, -r, r * 2, r * 2);
    ctx.restore();

    ballAngle += 0.1;


    //premik ploščice levo in desno
    if (rightDown && paddlex + paddlew + 5 <= WIDTH)
      paddlex += 5;
    else if (leftDown && paddlex - 5 >= 0)
      paddlex -= 5;
    ctx.fillStyle = paddlecolor;
    rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);
    //premikanje krogle
    if (x + dx > WIDTH - r || x + dx < r)
      dx = -dx;

    if (y + dy < r)
      dy = -dy;
    else if (y + dy > HEIGHT - r) {
      start = false;
      if (x > paddlex && x < paddlex + paddlew) {
        dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
        dy = -dy;
        start = true;
      }
      else {
        game_over();
        clearInterval(intervalId);
      }
    }

    x += dx;
    y += dy;

    var TROPHY = new Image();
    TROPHY.src = "slike/TROPHY.png";
    //riši opeke
    for (i = 0; i < NROWS; i++) {
      ctx.fillStyle = rowcolors[i]; //barvanje vrstic
      for (j = 0; j < NCOLS; j++) {
        if (bricks[i][j] == 1) {
          let x = (j * (BRICKWIDTH + PADDING)) + PADDING;
          let y = (i * (BRICKHEIGHT + PADDING)) + PADDING;
          let poly = [
            [x, y],
            [x + BRICKWIDTH, y],
            [x + BRICKWIDTH, y + BRICKHEIGHT],
            [x, y + BRICKHEIGHT]
          ];
          ctx.drawImage(TROPHY, (j * (BRICKWIDTH + PADDING)) + PADDING,
            (i * (BRICKHEIGHT + PADDING)) + PADDING, BRICKWIDTH, BRICKHEIGHT);

        }
      }
    }
    //RUŠENJE OPEK
    rowheight = BRICKHEIGHT + PADDING; //Smo zadeli opeko?
    colwidth = BRICKWIDTH + PADDING;
    row = Math.floor(y / rowheight);
    col = Math.floor(x / colwidth);
    //Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
    if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
      dy = -dy;
      bricks[row][col] = 0;
      tocke += 1;
      $("#tocke").html(tocke);

      // Get canvas position on screen
      const canvasOffset = $("#canvas").offset();
      scorePopus(canvasOffset.left + x, canvasOffset.top + y, "+1");

      checkWin();
    }
  }
  init_paddle();

  var rightDown = false;
  var leftDown = false;

  //nastavljanje leve in desne tipke
  function onKeyDown(evt) {
    if (evt.keyCode == 39) rightDown = true;
    else if (evt.keyCode == 37) leftDown = true;
    else if (evt.keyCode == 32) {
      paused = !paused;
      pavza();
    }
  }


  function onKeyUp(evt) {
    if (evt.keyCode == 39)
      rightDown = false;
    else if (evt.keyCode == 37) leftDown = false;
  }
  $(document).keydown(onKeyDown);
  $(document).keyup(onKeyUp);
  var bricks;
  var NROWS;
  var NCOLS;
  var BRICKWIDTH;
  var BRICKHEIGHT;
  var PADDING;

  function initbricks() { //inicializacija opek - polnjenje v tabelo
    NROWS = 2;
    NCOLS = 6;
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    BRICKHEIGHT = 150;
    PADDING = 1;
    bricks = new Array(NROWS);
    for (i = 0; i < NROWS; i++) {
      bricks[i] = new Array(NCOLS);
      for (j = 0; j < NCOLS; j++) {
        bricks[i][j] = 1;
      }
    }
  }

  initbricks();

  //timer
  var sekunde;
  var sekundeI;
  var minuteI;
  var intTimer;
  var izpisTimer;
  var start = true;
  //timer
  function timer() {
    if (start) {
      sekunde++;

      sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0" + sekundeI;
      minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0" + minuteI;
      izpisTimer = minuteI + ":" + sekundeI;

      $("#cas").html(izpisTimer);
    }
    else {
      sekunde = 0;
      $("#cas").html(izpisTimer);
    }
  }
  var tocke;
  function scorePopus(x, y, value = "+1") {
    const $pop = $(`<div class="score-popup">${value}</div>`);
    $("body").append($pop);
    $pop.css({
      position: "absolute",
      left: x + "px",
      top: y + "px",
      color: "#000",
      fontSize: "20px",
      fontWeight: "bold",
      zIndex: 9999,
      pointerEvents: "none",
    }).animate({
      top: y - 50 + "px",
      opacity: 0
    }, 1000, function () {
      $pop.remove();
    });
  }

  function reset() {
    x = 150;
    y = 150;
    dx = 2;
    dy = 4;
    clearInterval(intTimer);
    init_paddle();
    initbricks();
    init();
  }

  function game_over() {
    if (tocke > bestScore) {
      bestScore = tocke;
      localStorage.setItem('bestScore', bestScore);
      $("#bestScore").html(bestScore);
    }
    swal({
      title: 'Zgubil si!',
      text: 'Rezultat: ' + tocke,
      icon: 'warning',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(() => {
      reset(); // Reset the game after clicking OK
    });
  }

  function checkWin() {
    for (let i = 0; i < NROWS; i++) {
      for (let j = 0; j < NCOLS; j++) {
        if (bricks[i][j] === 1) return; // Exit if any brick remains
      }
    }
    // Add delay before showing win message
    setTimeout(() => {
      game_win();
    }, 10); // 500ms = 0.5s delay
  }

  function game_win() {
    // Stop the game (pause everything)
    clearInterval(intTimer);
    clearInterval(intervalId);
    start = false; // stop the timer from counting
    if (tocke > bestScore) {
      bestScore = tocke;
      localStorage.setItem('bestScore', bestScore);
      $("#bestScore").html(bestScore);
    }


    swal({
      title: 'Zmagal si!',
      text: 'Čestitke! Rezultat: ' + tocke,
      icon: 'warning',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(() => {
      reset(); // Reset the game after clicking OK
    });
  }

  function pavza() {
    if (paused) {
      clearInterval(intTimer);
      clearInterval(intervalId);
    }
    else {
      start2();
    }
  }
  $("#resetBestScore").click(function () {
    // Stop the game
    clearInterval(intTimer);
    clearInterval(intervalId);
    start = false;
    paused = true;

    // Reset best score
    bestScore = 0;
    localStorage.setItem('bestScore', bestScore);
    $("#bestScore").html(bestScore);

    swal({
      title: 'Poenostavljen rezultat!',
      text: 'Rezultat: ' + tocke,
      icon: 'warning',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(() => {
      reset(); // Reset the game after clicking OK
    });
  });

  $("#startBtn").click(function () {
    if (!intervalId) {
      init(); // Initialize the game if not running
    }
  });

  $("#pauseBtn").click(function () {
    paused = !paused;
    pavza(); // Same as spacebar
  });

  $("#finishBtn").click(function () {
    clearInterval(intTimer);
    clearInterval(intervalId);
    start = false;

    if (tocke > bestScore) {
      bestScore = tocke;
      localStorage.setItem('bestScore', bestScore);
      $("#bestScore").html(bestScore);
    }


    swal({
      title: 'Igra je končana!',
      text: 'Rezultat: ' + tocke,
      icon: 'warning',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(() => {
      reset(); // Reset the game after clicking OK
    });
  });
}
