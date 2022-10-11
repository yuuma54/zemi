// - global----------------------------
let screenCanvas, info;
let run = true;
let fps = 1000 / 30;
let mouse = new Point();
let ctx; // canvas2d コンテキスト格納用
let fire = false;
let counter = 0;

let CHARA_COLOR = 'rgba(0, 0, 255, 0.75)';
let CHARA_SHOT_COLOR = 'rgba(0, 255, 0, 0.75)';
let CHARA_SHOT_MAX_COUNT = 10

let ENEMY_COLOR = 'rgba(255, 0, 0, 0.75)';
let ENEMY_MAX_COUNT = 10;
let ENEMY_SHOT_COLOR = 'rgba(255, 0, 255, 0.75)';
let ENEMY_SHOT_MAX_COUNT = 100;

// - main ---------------------
window.onload = function () {

    var i, j;
    var p = new Point();

    // スクリーンの初期化
    screenCanvas = document.getElementById('screen');
    screenCanvas.width = 256;
    screenCanvas.height = 256;

    // 2dコンテキスト
    ctx = screenCanvas.getContext('2d');

    // イベントの登録
    screenCanvas.addEventListener('mousemove', mouseMove, true);
    screenCanvas.addEventListener('mousedown', mouseDown, true);
    window.addEventListener('keydown', keyDown, true);

    // その他のエレメント関連
    info = document.getElementById('info');

    // 自動初期化
    let chara = new Character();
    chara.init(10);

    let charaShot = new Array(CHARA_SHOT_MAX_COUNT);
    for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
        charaShot[i] = new CharacterShot();
    }

    let enemy = new Array(ENEMY_MAX_COUNT);
    for (i = 0; i < ENEMY_MAX_COUNT; i++) {
        enemy[i] = new Enemy();
    }

    let enemyShot = new ArrayBuffer(ENEMY_SHOT_MAX_COUNT);
    for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
        enemyShot[i] = new EnemyShot();
    }


    // レンダリング処理を呼び出す
    (function () {
        counter++
        //HTMLを更新
        info.innerHTML = mouse.x + ' : ' + mouse.y;

        // screenクリア
        ctx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

        // パスの設定を開始
        ctx.beginPath();

        // 自機の位置を設定
        chara.position.x = mouse.x;
        chara.position.y = mouse.y;

        // 自機を描くパスを設定
        ctx.arc(chara.position.x, chara.position.y, chara.size, 0, Math.PI * 2, false);

        // 自機の色を設定する
        ctx.fillStyle = CHARA_COLOR;

        // 自機を描く
        ctx.fill();

        // フラグにより再帰呼び出し
        if (run) { setTimeout(arguments.callee, fps); }

        // fireフラグの値により分岐
        if (fire) {
            // すべての自爆ショットを調査する
            for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
                // 自機ショットが既に発射されているかチェック
                if (!charaShot[i].alive) {
                    // 自機ショットを新規にセット
                    charaShot[i].set(chara.position, 3, 5);

                    // ループを抜ける
                    break;
                }
            }
            // フラグを降ろしておく
            fire = false;
        }

        // パスの設定を開始
        ctx.beginPath();

        // すべての自機ショットを調査する
        for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
            // 自機ショットが既に発射されているかチェック
            if (charaShot[i].alive) {
                // 自機ショットを動かす
                charaShot[i].move();

                // 自機ショットを描くパスを設定
                ctx.arc(
                    charaShot[i].position.x,
                    charaShot[i].position.y,
                    charaShot[i].size,
                    0, Math.PI * 2, false
                );

                // パスをいったん閉じる
                ctx.closePath();
            }
        }

        // 自機ショットの色を設定する
        ctx.fillStyle = CHARA_SHOT_COLOR;

        // 自機ショットを描く
        ctx.fill();

        // エネミーの出現管理----------
        // 100 フレームに一度出現させる
        if (counter % 100 === 0) {
            // すべてのエネミーを調査する
            for (i = 0; i < ENEMY_MAX_COUNT; i++) {
                // エネミーの生存フラグをチェック
                if (!enemy[i].alive) {

                    enemy[i].move();

                    // タイプを決定するパラメータを算出
                    j = (counter % 200) / 100;

                    // タイプに応じて初期位置を決める
                    let enemySize = 15;
                    p.x = -enemySize + (screenCanvas.width + enemySize * 2) * j
                    p.y = screenCanvas.height / 2;
                    // console.log(p)

                    // エネミーを新規にセット
                    enemy[i].set(p, enemySize, j);

                    // ctx.arc(
                    //     enemy[i].position.x,
                    //     enemy[i].position.y,
                    //     enemy[i].size,
                    //     0, Math.PI * 2, false
                    // );

                    // １体出現させたのでループを抜ける
                    break;
                };
            }
        }

        ctx.beginPath();

        for (i = 0; i < ENEMY_MAX_COUNT; i++) {
            if (enemy[i].alive) {
                enemy[i].move();

                ctx.arc(
                    enemy[i].position.x,
                    enemy[i].position.y,
                    0, Math.PI * 2, false
                );
                ctx.closePath();
            }
        }

        // 敵の色を指定する
        ctx.fillStyle = ENEMY_COLOR;

        // 敵を描く
        ctx.fill();

        if (run) { setTimeout(arguments.callee, fps); }
    })();

};


// - event ------
function mouseMove(event) {
    //　マウスカーソル座標の更新
    mouse.x = event.clientX - screenCanvas.offsetLeft;
    mouse.y = event.clientY - screenCanvas.offsetTop;
}

function mouseDown(event) {
    // フラグを立てる
    fire = true;
}

function keyDown(event) {
    // キーコードを取得
    let ck = event.keyCode;

    //Escキーが押されたらフラグを降ろす
    if (ck === 27) { run = false; }
}