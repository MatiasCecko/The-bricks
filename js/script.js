function drawIt() {
  let x, y, dx, dy, ballAngle = 0;
  let WIDTH, HEIGHT, r = 15;
  let ctx, paused = false, start = true;
  let paddlex, paddleh, paddlew;
  let rightDown = false, leftDown = false;
  let sekunde = 0, sekundeI, minuteI, izpisTimer = "00:00";
  let intTimer, intervalId;
  let tocke = 0, bestScore = 0;
  let bricks, NROWS, NCOLS, BRICKWIDTH, BRICKHEIGHT, PADDING;
  const rowcolors = ["#fff", "#fff", "#fff", "#fff", "#fff"];
  const paddlecolor = "#fff", ballcolor = "#ff0";
  const ballImg = new Image(); ballImg.src = "slike/ball.png";
  const TROPHY = new Image(); TROPHY.src = "slike/TROPHY.png";
  const paddleImg = new Image(); paddleImg.src = "slike/bicyclekick.png";
  let scorePopups = [];


  function init() {
    ctx = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    setBallSpeed();
    x = HEIGHT / 2;
    y = WIDTH - 15;
    tocke = 0;
    paused = false;
    start = true;
    $("#tocke").html(tocke);
    bestScore = localStorage.getItem('bestScore') || 0;
    $("#bestScore").html(bestScore);
    init_paddle();
    initbricks();
    start2();
  }

  function start2() {
    intTimer = setInterval(timer, 1000);
    intervalId = setInterval(draw, 10);
  }


  function init_paddle() {
    paddlew = 150;
    paddlex = WIDTH / 2 - paddlew / 2;
    paddleh = 120;
  }

  //Težavnost igre
  function setBallSpeed() {
    const level = $("#difficulty").val();
    if (level === "easy") [dx, dy] = [2, 3];
    else if (level === "medium") [dx, dy] = [4, 6];
    else if (level === "hard") [dx, dy] = [8, 10];
  }


  function initbricks() {
    NROWS = 3;
    NCOLS = 6;
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    BRICKHEIGHT = 150;
    PADDING = 1;
    bricks = Array.from({ length: NROWS }, () => Array(NCOLS).fill(1));
  }


  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
  }

  function drawScorePopups() {
    const now = Date.now();
    scorePopups = scorePopups.filter(p => now - p.time < 600);
    for (const popup of scorePopups) {
      const elapsed = now - popup.time;
      const opacity = 1 - elapsed / 600;
      const yOffset = -elapsed / 15;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.fillText("+" + popup.points, popup.x, popup.y + yOffset);
      ctx.restore();
    }
  }

  function draw() {
    if (paused) return;

    clear();
    ctx.fillStyle = ballcolor;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-ballAngle);
    ctx.drawImage(ballImg, -r, -r, r * 2, r * 2);
    ctx.restore();
    ballAngle += 0.1;

    //Paddle
    if (rightDown && paddlex + paddlew + 5 <= WIDTH) paddlex += 5;
    else if (leftDown && paddlex - 5 >= 0) paddlex -= 5;

    ctx.fillStyle = paddlecolor;
    ctx.drawImage(paddleImg, paddlex, HEIGHT - paddleh, paddlew, paddleh);

    //Žogica
    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
    if (y + dy < r) dy = -dy;
    else if (y + dy > HEIGHT - r) {
      if (x > paddlex && x < paddlex + paddlew) {
        dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
        dy = -dy;
      } else {
        game_over();
        clearInterval(intervalId);
        return;
      }
    }

    x += dx;
    y += dy;

    //Nariši brickse
    for (let i = 0; i < NROWS; i++) {
      ctx.fillStyle = rowcolors[i];
      for (let j = 0; j < NCOLS; j++) {
        if (bricks[i][j] === 1) {
          const bx = (j * (BRICKWIDTH + PADDING)) + PADDING;
          const by = (i * (BRICKHEIGHT + PADDING)) + PADDING;
          ctx.drawImage(TROPHY, bx, by, BRICKWIDTH, BRICKHEIGHT);
        }
      }
    }


    const rowheight = BRICKHEIGHT + PADDING;
    const colwidth = BRICKWIDTH + PADDING;
    const row = Math.floor(y / rowheight);
    const col = Math.floor(x / colwidth);

    if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] === 1) {
      dy = -dy;
      bricks[row][col] = 0;
      tocke++;
      playBrickHitSound();
      $("#tocke").html(tocke);
      const canvasOffset = $("#canvas").offset();
      scorePopus(canvasOffset.left + x, canvasOffset.top + y, "+1");
      checkWin();
    }

    drawScorePopups();
  }

  //+1 animation
  function scorePopus(x, y, value = "+1") {
    const $pop = $(`<div class="score-popup">${value}</div>`);
    $("body").append($pop);
    $pop.css({
      position: "absolute",
      left: x + "px",
      top: y + "px",
      color: "#fff",
      fontSize: "20px",
      fontWeight: "bold",
      zIndex: 9999,
      pointerEvents: "none",
    }).animate({
      top: y - 50 + "px",
      opacity: 0
    }, 1000, () => $pop.remove());
  }

  //Končana igra
  function game_over() {
    start = false;
    clearInterval(intTimer);
    clearInterval(intervalId);

    if (tocke > bestScore) {
      bestScore = tocke;
      localStorage.setItem('bestScore', bestScore);
      $("#bestScore").html(bestScore);
    }

    swal({
      title: 'Zgubil si!',
      text: 'Rezultat: ' + tocke,
      icon: 'slike/sui.png',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(function () {
      window.location.reload();
    });
  }





  function checkWin() {
    for (let i = 0; i < NROWS; i++) {
      for (let j = 0; j < NCOLS; j++) {
        if (bricks[i][j] === 1) return;
      }
    }
    setTimeout(game_win, 10);
  }

  function game_win() {
    clearInterval(intTimer);
    clearInterval(intervalId);
    start = false;
    if (tocke > bestScore) {
      bestScore = tocke;
      localStorage.setItem('bestScore', bestScore);
      $("#bestScore").html(bestScore);
    }

    swal({
      title: 'Zmagal si!',
      text: 'Čestitke! Rezultat: ' + tocke,
      icon: 'slike/TROPHY2.png',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(function () {
      window.location.reload();
    });
  }



  function reset() {
    x = 150;
    y = 150;
    dx = 2;
    dy = 4;
    clearInterval(intTimer);
    clearInterval(intervalId);
    sekunde = 0; // ✅ reset timer
    izpisTimer = "00:00";
    $("#cas").html(izpisTimer);
    init();
  }


  //Timer
  function timer() {
    if (start) {
      sekunde++;
      sekundeI = (sekunde % 60).toString().padStart(2, "0");
      minuteI = Math.floor(sekunde / 60).toString().padStart(2, "0");
      izpisTimer = `${minuteI}:${sekundeI}`;
      $("#cas").html(izpisTimer);
    } else {
      sekunde = 0;
      $("#cas").html(izpisTimer);
    }
  }

  //Pavza
  function pavza() {
    if (paused) {
      clearInterval(intTimer);
      clearInterval(intervalId);
    } else {
      start2();
    }
  }

  //Vključevanje tipkovnice
  $(document).keydown(function (evt) {
    if (evt.keyCode === 39) rightDown = true;
    else if (evt.keyCode === 37) leftDown = true;
    else if (evt.keyCode === 32) {
      paused = !paused;
      pavza();
    }
  });

  $(document).keyup(function (evt) {
    if (evt.keyCode === 39) rightDown = false;
    else if (evt.keyCode === 37) leftDown = false;
  });

  //Buttons
  $("#resetBestScore").click(function () {
    clearInterval(intTimer);
    clearInterval(intervalId);
    start = false;
    paused = true;

    bestScore = 0;
    localStorage.setItem('bestScore', bestScore);
    $("#bestScore").html(bestScore);

    swal({
      title: 'Najboljši rezultat je bil ponastavljen!',
      text: 'Tvoj rezultat: ' + tocke,
      icon: 'slike/sui.png',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(function () {
      window.location.reload();
    })
  });

  $("#pauseBtn").click(function () {
    paused = !paused;
    pavza();
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
      icon: 'slike/sui.png',
      button: {
        text: 'OK',
        className: 'swal-button-gameover',
      }
    }).then(function () {
      window.location.reload();
    })
  });


  $("#startBtn").click(function () {
    const sound = document.getElementById('startSound');
    sound.volume = 0.1; // VOLUMEN HIMNE
    sound.play().catch(e => console.log("Autoplay blocked:", e));
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (intTimer) {
      clearInterval(intTimer);
      intTimer = null;
    }
    start = true;
    sekunde = 0;
    izpisTimer = "00:00";
    $("#cas").html(izpisTimer);
    init(); // Začni igro
  });
  //ko zadane birck naredi sound
  function playBrickHitSound() {
    const sound = document.getElementById("hitSound");
    sound.currentTime = 0;
    hitSound.volume = 0.25;
    sound.play().catch(e => console.log("Sound blocked:", e));
  }


}
