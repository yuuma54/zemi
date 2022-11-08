const static = nipplejs.create({
  zone: document.getElementById('gamepad'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: 'white',
  size: 100,
  dynamicPage: true
});

static.on('start end move', (e, data) => {
	console.log(data);
});

// デバッグのフラグ
const DEBUG = true;

let drawCount = 0;
let fps = 0;
let lastTime = Date.now();

//ゲームスピード(ms)
const GAME_SPEED = 1000 / 60;

//画面サイズ
const SCREEN_W = 180;
const SCREEN_H = 320;

//キャンバスサイズ
const CANVAS_W = SCREEN_W * 2;
const CANVAS_H = SCREEN_H * 2;

//フィールドサイズ
const FIELD_W = SCREEN_W * 2;
const FIELD_H = SCREEN_H * 2;

//星の数
const STAR_MAX = 300;

//キャンバス
let can = document.getElementById('can');
let con = can.getContext('2d');
can.width = CANVAS_W;
can.height = CANVAS_H;

//フィールド（仮想画面）
let vcan = document.createElement('canvas');
let vcon = vcan.getContext('2d');
vcan.width = FIELD_W;
vcan.height = FIELD_H;

//カメラの座標
let camera_x = 0;
let camera_y = 0;

//星の実体
let star = [];

// キーボードの状態
let key = [];

// キーボードが押されたとき
document.addEventListener('keydown', function (e) {
  key[e.code] = true;
});

// キーボードが離されたとき
document.addEventListener('keyup', function (e) {
  key[e.code] = false;
});

// 弾クラス
class Tama {
  constructor(x, y, vx, vy) {
    this.sn = 5;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.kill = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (
      this.x < 0 ||
      this.x > FIELD_W << 8 ||
      this.y < 0 ||
      this.y > FIELD_H << 8
    )
      this.kill = true;
  }

  draw() {
    drawSprite(this.sn, this.x, this.y);
  }
}

let tama = [];

// 自機クラス
class Jiki {
  constructor() {
    this.x = (FIELD_W / 2) << 8;
    this.y = (FIELD_H / 2) << 8;
    this.speed = 512;
    this.anime = 0;
    this.reload = 0;
    this.relo2 = 0;
  }

  // 自機の移動
  update() {
    if (key['Space'] && this.reload == 0) {
      tama.push(new Tama(this.x + (4 << 8), this.y - (10 << 8), 0, -2000));
      tama.push(new Tama(this.x - (4 << 8), this.y - (10 << 8), 0, -2000));
      tama.push(new Tama(this.x + (8 << 8), this.y - (10 << 8), 80, -2000));
      tama.push(new Tama(this.x - (8 << 8), this.y - (10 << 8), -80, -2000));

      this.reload = 4;
      if (++this.relo2 == 4) {
        this.reload = 20;
        this.relo2 = 0;
      }
    }
    if (!!key['Spece']) this.reload = this.relo2 = 0;

    if (this.reload > 0) this.reload--;
    if (key['ArrowLeft'] && this.x > this.speed) {
      this.x -= this.speed;
      if (this.anime > -8) this.anime--;
    } else if (key['ArrowRight'] && this.x <= (FIELD_W << 8) - this.speed) {
      this.x += this.speed;
      if (this.anime < 8) this.anime++;
    } else {
      if (this.anime > 0) this.anime--;
      if (this.anime < 0) this.anime++;
    }

    if (key['ArrowUp'] && this.y > this.speed) this.y -= this.speed;

    if (key['ArrowDown'] && this.y <= (FIELD_H << 8) - this.speed)
      this.y += this.speed;
  }

  // 描画
  draw() {
    drawSprite(2 + (this.anime >> 2), this.x, this.y);
  }
}

let jiki = new Jiki();

// ファイルを読み込み
let spriteImege = new Image();
spriteImege.src = 'sprite.png';

//スプライトクラス
class Sprite {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

// スプライト
let sprite = [
  new Sprite(0, 0, 22, 42), // 自機左２
  new Sprite(23, 0, 33, 42), // 自機左１
  new Sprite(57, 0, 43, 42), // 自機正面
  new Sprite(101, 0, 33, 42), // 自機右１
  new Sprite(135, 0, 21, 42), // 自機右２

  new Sprite(0, 50, 3, 7), // 弾１
  new Sprite(4, 50, 5, 5), // 弾２
];

//スプライトを描画
function drawSprite(snum, x, y) {
  let sx = sprite[snum].x;
  let sy = sprite[snum].y;
  let sw = sprite[snum].w;
  let sh = sprite[snum].h;

  let px = (x >> 8) - sw / 2;
  let py = (y >> 8) - sh / 2;

  if (
    px + sw / 2 < camera_x ||
    px - sw / 2 >= camera_x + SCREEN_W ||
    py + sh / 2 < camera_y ||
    py - sh / 2 >= camera_y + SCREEN_H
  )
    return;

  vcon.drawImage(spriteImege, sx, sy, sw, sh, px, py, sw, sh);
}

//整数のランダムを作る
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//星クラス
class Star {
  constructor() {
    this.x = rand(0, FIELD_W) << 8;
    this.y = rand(0, FIELD_H) << 8;
    this.vx = 0;
    this.vy = rand(30, 200);
    this.sz = rand(1, 2);
  }

  draw() {
    let x = this.x >> 8;
    let y = this.y >> 8;

    if (
      x < camera_x ||
      x >= camera_x + SCREEN_W ||
      y < camera_y ||
      y >= camera_y + SCREEN_H
    )
      return;

    vcon.fillStyle = rand(0, 2) != 0 ? '66f' : '#8af';
    vcon.fillRect(x, y, this.sz, this.sz);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > FIELD_H << 8) {
      this.y = 0;
      this.x = rand(0, FIELD_W) << 8;
    }
  }
}

//ゲーム初期化
function gameInit() {
  for (let i = 0; i < STAR_MAX; i++) star[i] = new Star();
  setInterval(gameLoop, GAME_SPEED);
}
//ゲームループ
function gameLoop() {
  //移動の処理

  for (let i = 0; i < STAR_MAX; i++) star[i].update();
  for (let i = tama.length - 1; i >= 0; i--) {
    tama[i].update();
    if (tama[i].kill) tama.splice(i, 1);
  }
  jiki.update();

  //描画の処理

  vcon.fillStyle = 'black';
  vcon.fillRect(camera_x, camera_y, SCREEN_W, SCREEN_H);

  for (let i = 0; i < STAR_MAX; i++) star[i].draw();
  for (let i = 0; i < tama.length; i++) tama[i].draw();

  jiki.draw();

  // 自機の範囲0 ~ Field_w
  // カメラの範囲０～(Field_w - Screen_w)
  camera_x = ((jiki.x >> 8) / FIELD_W) * (FIELD_W - SCREEN_W);
  camera_y = ((jiki.y >> 8) / FIELD_H) * (FIELD_H - SCREEN_H);

  //仮想画面から実際のキャンバスにコピー

  con.drawImage(
    vcan,
    camera_x,
    camera_y,
    SCREEN_W,
    SCREEN_H,
    0,
    0,
    CANVAS_W,
    CANVAS_H
  );

  if (DEBUG) {
    drawCount++;
    if (lastTime + 1000 <= Date.now()) {
      fps = drawCount;
      drawCount = 0;
      lastTime = Date.now();
    }

    con.font = "20px 'Impact'";
    con.fillStyle = 'White';
    con.fillText('FPS :' + fps, 20, 20);
    con.fillText('Tama:' + tama.length, 20, 40);
  }
}

//オンロードでゲーム開始
window.onload = function () {
  gameInit();
};
