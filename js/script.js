let ctx,
  WIDTH, HEIGHT,
  x, y, dx, dy,
  r = 15,
  ballAngle = 0,
  paused = false,
  running = false,
  paddlex, paddlew = 150, paddleh = 20,
  rightDown = false, leftDown = false,
  sekunde = 0, intTimer, intervalId,
  tocke = 0, bestScore = 0,
  bricks, NROWS, NCOLS, BRICKWIDTH, BRICKHEIGHT, PADDING,
  scorePopups = [];

const rowcolors = ["#fff", "#fff", "#fff", "#fff", "#fff"];
const paddlecolor = "#fff",
  ballcolor = "#ff0";

const ballImg = new Image(); ballImg.src = "slike/ball.png";
const paddleImg = new Image(); paddleImg.src = "slike/bicyclekick.png";
const TROPHY = new Image(); TROPHY.src = "slike/TROPHY.png";


function environmentInit() {
  ctx = $('#canvas')[0].getContext("2d");
  WIDTH = $('#canvas').width();
  HEIGHT = $('#canvas').height();


  init_paddle();
  init_bricks();

  // postavite žogo na sredino nad peddle
  x = WIDTH / 2;
  y = HEIGHT - paddleh - r - 5;

  tocke = 0;
  $('#tocke').text(tocke);
  bestScore = localStorage.getItem('bestScore') || 0;
  $('#bestScore').text(bestScore);
  sekunde = 0;
  $('#cas').text("00:00");

  drawStatic();
  bindControls();
}

// narišite brikse zogo in paddle
function drawStatic() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // zoga
  ctx.save();
  ctx.translate(x, y);
  ctx.drawImage(ballImg, -r, -r, 2 * r, 2 * r);
  ctx.restore();

  // paddle
  ctx.drawImage(paddleImg, paddlex, HEIGHT - paddleh, paddlew, paddleh);

  // bricks
  for (let i = 0; i < NROWS; i++) {
    ctx.fillStyle = rowcolors[i];
    for (let j = 0; j < NCOLS; j++) {
      if (bricks[i][j]) {
        const bx = j * (BRICKWIDTH + PADDING) + PADDING;
        const by = i * (BRICKHEIGHT + PADDING) + PADDING;
        ctx.drawImage(TROPHY, bx, by, BRICKWIDTH, BRICKHEIGHT);
      }
    }
  }
}


function bindControls() {
  $('#startBtn').off('click').on('click', startGame);
  $('#pauseBtn').off('click').on('click', togglePause);
  $('#finishBtn').off('click').on('click', finishGame);
  $('#resetBestScore').off('click').on('click', resetBestScore);

  $(document).keydown(evt => {
    if (evt.key === 'ArrowRight') rightDown = true;
    else if (evt.key === 'ArrowLeft') leftDown = true;
    else if (evt.key === ' ') togglePause();
  });
  $(document).keyup(evt => {
    if (evt.key === 'ArrowRight') rightDown = false;
    else if (evt.key === 'ArrowLeft') leftDown = false;
  });
}


function startGame() {
  const sound = document.getElementById('startSound');
  sound.volume = 0.1; // VOLUMEN HIMNE
  sound.play().catch(e => console.log("Autoplay blocked:", e));
  if (running) return;
  running = true;
  setBallSpeed();
  sekunde = 0;
  $('#cas').text("00:00");
  paused = false;

  intTimer = setInterval(timer, 1000);
  intervalId = setInterval(draw, 10);
}


function togglePause() {
  paused = !paused;
  if (paused) {
    clearInterval(intTimer);
    clearInterval(intervalId);
  } else {
    intTimer = setInterval(timer, 1000);
    intervalId = setInterval(draw, 10);
  }
}

// takoj konca igro
function finishGame() {
  running && gameOver();
}


function resetBestScore() {
  clearInterval(intTimer);
  clearInterval(intervalId);
  running = paused = false;
  bestScore = 0;
  localStorage.setItem('bestScore', 0);
  $('#bestScore').text(0);
  swal({
    title: 'Najboljši rezultat je bil ponastavljen!',
    icon: 'slike/sui.png',
    button: { text: 'OK', className: 'swal-button-gameover' }
  })
}


function draw() {
  if (paused) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);


  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-ballAngle);
  ctx.drawImage(ballImg, -r, -r, 2 * r, 2 * r);
  ctx.restore();
  ballAngle += 0.1;

  // premikanje pedla
  if (rightDown && paddlex + paddlew <= WIDTH) paddlex += 5;
  if (leftDown && paddlex >= 0) paddlex -= 5;
  ctx.drawImage(paddleImg, paddlex, HEIGHT - paddleh, paddlew, paddleh);


  if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
  if (y + dy < r) dy = -dy;
  else if (y + dy > HEIGHT - r) {

    if (x > paddlex && x < paddlex + paddlew) {
      dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
      dy = -dy;
    } else {
      gameOver();
      return;
    }
  }

  x += dx;
  y += dy;


  for (let i = 0; i < NROWS; i++) {
    for (let j = 0; j < NCOLS; j++) {
      if (!bricks[i][j]) continue;
      const bx = j * (BRICKWIDTH + PADDING) + PADDING;
      const by = i * (BRICKHEIGHT + PADDING) + PADDING;
      ctx.drawImage(TROPHY, bx, by, BRICKWIDTH, BRICKHEIGHT);
    }
  }
  const row = Math.floor(y / (BRICKHEIGHT + PADDING));
  const col = Math.floor(x / (BRICKWIDTH + PADDING));
  if (row < NROWS && col < NCOLS && bricks[row][col]) {
    dy = -dy;
    bricks[row][col] = 0;
    tocke++;
    playBrickHitSound();
    $('#tocke').text(tocke);
    drawStatic();
    spawnScorePopup(x, y, "+1");
    if (checkWin()) gameWin();
  }

  drawScorePopups();
}


function timer() {
  if (!running) return;
  sekunde++;
  const m = String(Math.floor(sekunde / 60)).padStart(2, '0');
  const s = String(sekunde % 60).padStart(2, '0');
  $('#cas').text(`${m}:${s}`);
}


function gameOver() {
  clearInterval(intTimer);
  clearInterval(intervalId);

  const sound = document.getElementById('startSound');
  sound.pause();
  sound.currentTime = 0;

  running = false;
  if (tocke > bestScore) {
    bestScore = tocke;
    localStorage.setItem('bestScore', bestScore);
    $('#bestScore').text(bestScore);
  }
  swal({
    title: 'Zgubil si!',
    text: 'Rezultat: ' + tocke,
    icon: 'slike/sui.png',
    button: { text: 'OK', className: 'swal-button-gameover' }
  }).then(() => {
    clearInterval(intTimer);
    clearInterval(intervalId);
    running = false;
    paused = true;
    environmentInit();
  });
}

function gameWin() {
  running = false;
  clearInterval(intTimer);
  clearInterval(intervalId);

  const sound = document.getElementById('startSound');
  sound.pause();
  sound.currentTime = 0;

  if (tocke > bestScore) {
    bestScore = tocke;
    localStorage.setItem('bestScore', bestScore);
    $('#bestScore').text(bestScore);
  }
  swal({
    title: 'Zmagal si!',
    text: 'Čestitke! Rezultat: ' + tocke,
    icon: 'slike/TROPHY2.png',
    button: { text: 'OK', className: 'swal-button-gameover' }
  }).then(() => {
    clearInterval(intTimer);
    clearInterval(intervalId);
    running = false;
    paused = true;
    environmentInit();
  });
}


function init_paddle() {
  paddlew = 150;
  paddleh = 100;
  paddlex = WIDTH / 2 - paddlew / 2;
}


function init_bricks() {
  NROWS = 3;
  NCOLS = 6;
  BRICKWIDTH = WIDTH / NCOLS - 1;
  BRICKHEIGHT = 145;
  PADDING = 1;
  bricks = Array.from({ length: NROWS }, () => Array(NCOLS).fill(1));
}


function setBallSpeed() {
  const level = $('#difficulty').val();
  if (level === 'easy') [dx, dy] = [0, -3];
  else if (level === 'medium') [dx, dy] = [0, -6];
  else[dx, dy] = [0, -10];
}

// popup animation
function spawnScorePopup(x0, y0, txt) {
  scorePopups.push({ x: x0, y: y0, text: txt, time: Date.now() });
}
function drawScorePopups() {
  const now = Date.now();
  scorePopups = scorePopups.filter(p => now - p.time < 600);
  scorePopups.forEach(p => {
    const elapsed = now - p.time;
    const alpha = 1 - elapsed / 600;
    const yoff = -elapsed / 15;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 25px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(p.text, p.x, p.y + yoff);
    ctx.restore();
  });
}

// brick hit sound
function playBrickHitSound() {
  const snd = document.getElementById('hitSound');
  snd.currentTime = 0;
  snd.volume = 0.25;
  snd.play().catch(() => { });
}


function checkWin() {
  return bricks.every(row => row.every(cell => cell === 0));
}
