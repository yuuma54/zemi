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

// スムージング
const SMOOTHING = false;

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

con.mozimageSmoothingEnagbled = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled = SMOOTHING;
con.imageSmoothingEnabled = SMOOTHING;

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

// ボタン
const btn = document.getElementById('btn')

// オブジェクト
let teki = [];
let tama = [];
let teta = [];
let jiki = new Jiki();

// ファイルを読み込み
let spriteImege = new Image();
spriteImege.src = 'sprite.png';


//------------------------------------------------------
//ゲーム初期化
function gameInit() {
  for (let i = 0; i < STAR_MAX; i++) star[i] = new Star();
  setInterval(gameLoop, GAME_SPEED);
}

// オブジェクトをアップデート
function updateObj(obj) {
  for (let i = obj.length - 1; i >= 0; i--) {
    obj[i].update();
    if (obj[i].kill) obj.splice(i, 1);
  }
}

// オブジェクトを描画
function drawObj(obj) {
  for (let i = 0; i < obj.length; i++) obj[i].draw();
}

// 移動の処理
function updateAll() {
  updateObj(star);
  updateObj(tama);
  updateObj(teki);
  updateObj(teta);
  jiki.update();

}

// 描画の処理
function drawAll() {
  vcon.fillStyle = 'black';
  vcon.fillRect(camera_x, camera_y, SCREEN_W, SCREEN_H);

  drawObj(star);
  drawObj(tama);
  jiki.draw();
  drawObj(teta);
  drawObj(teki);

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
}

// 情報の処理
function putInfo() {
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
    con.fillText('Teki:' + teki.length, 20, 60);
    con.fillText('Teta:' + teta.length, 20, 80);
  }
}

//ゲームループ
function gameLoop() {
  // テスト的に敵を出す
  if (rand(0, 30) == 1)
    teki.push(new Teki(39, rand(0, FIELD_W) << 8, 0, 0, rand(300, 1200)));

  updateAll();
  drawAll();
  putInfo();
}

//オンロードでゲーム開始
window.onload = function () {
  gameInit();
};

// ボタンを押されたとき
document.addEventListener('touchstart', OnButton, false);
// ----------------------------------------------

function OnButton() {
    console.log('ボタンが押された')
    jiki.fire = true
};
// ----------------------------------------------