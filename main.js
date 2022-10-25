// - global----------------------------
let screenCanvas, info;
let run = true;
let fps = 1000 / 30;
let mouse = new Point();
let ctx; // canvas2d コンテキスト格納用
let fire = false;
let counter = 0;
let score = 0;
let message = '';

const STAR_MAX = 300;

let CHARA_COLOR = 'rgba(0, 0, 255, 0.75)';
let CHARA_SHOT_COLOR = 'rgba(0, 255, 0, 0.75)';
let CHARA_SHOT_MAX_COUNT = 10

let ENEMY_COLOR = 'rgba(255, 0, 0, 0.75)';
let ENEMY_MAX_COUNT = 10;
let ENEMY_SHOT_COLOR = 'rgba(255, 0, 255, 0.75)';
let ENEMY_SHOT_MAX_COUNT = 100;

let BOSS_COLOR = 'rgba(128, 128, 128, 0.75)';
let BOSS_BIT_COLOR = 'rgba(64, 64, 64, 0.75)';
let BOSS_BIT_COUNT = 5;

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Star {
    constructor() {
        this.x = rand(0, 375);
        this.y = rand(0, 600);
        this.vx = 0;
        this.vy = rand(30, 200);
        this.sz;
    }
}

// - main ---------------------
window.onload = function () {

    let i, j;
    let p = new Point();

    // スクリーンの初期化
    screenCanvas = document.getElementById('screen');
    screenCanvas.width = 375;
    screenCanvas.height = 600;

    mouse.x = screenCanvas.width / 2;
    mouse.y = screenCanvas.height - 20;

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
    // ボス初期化
    let boss = new Boss();

    // ボスのビットを初期化
    let bit = new Array(BOSS_BIT_COUNT);
    for (i = 0; i < BOSS_BIT_COUNT; i++) {
        bit[i] = new Bit();
    }


    // レンダリング処理を呼び出す
    (function () {
        // カウンタをインクリメント
        counter++

        // screenクリア
        ctx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

        // 自機-------------------------------------------------
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
        // if (run) { setTimeout(arguments.callee, fps); }

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

        // エネミーの出現管理 -------------------------------------------------
        // 1000 フレーム目までは 100 フレームに一度出現させる
        if (counter % 100 === 0 && counter < 1000) {
            // すべてのエネミーを調査する
            for (i = 0; i < ENEMY_MAX_COUNT; i++) {
                // エネミーの生存フラグをチェック
                if (!enemy[i].alive) {
                    // タイプを決定するパラメータを算出
                    j = (counter % 200) / 100;

                    // タイプに応じて初期位置を決める
                    var enemySize = 15;
                    p.x = -enemySize + (screenCanvas.width + enemySize * 2) * j
                    p.y = screenCanvas.height / 2;

                    // エネミーを新規にセット
                    enemy[i].set(p, enemySize, j);

                    // 1体出現させたのでループを抜ける
                    break;
                }
            }
        } else if (counter === 1000) {
            // 1000 フレーム目にボスを出現させる
            p.x = screenCanvas.width / 2;
            p.y = -80;
            boss.set(p, 50, 30);

            // 同時にビットも出現させる
            for (i = 0; i < BOSS_BIT_COUNT; i++) {
                j = 360 / BOSS_BIT_COUNT;
                bit[i].set(boss, 15, 5, i * j);
            }
        }

        // カウンターの値によってシーン分岐
        switch (true) {
            // カウンターの値が70より小さい
            case counter < 70:
                message = 'READY...';
                break;

            // カウンターの値が100より小さい
            case counter < 100:
                message = 'GO!!';
                break;

            // カウンターの値が100以上
            default:
                message = '';


                ctx.beginPath();

                for (i = 0; i < ENEMY_MAX_COUNT; i++) {
                    if (enemy[i].alive) {
                        enemy[i].move();

                        ctx.arc(
                            enemy[i].position.x,
                            enemy[i].position.y,
                            enemy[i].size,
                            0, Math.PI * 2, false
                        );

                        // ショットを打つかどうかパラメータの値からチェック
                        if (enemy[i].param % 30 === 0) {
                            // エネミーショットを調査する
                            for (j = 0; j < ENEMY_SHOT_MAX_COUNT; j++) {
                                if (!enemyShot[j].alive) {
                                    // エネミーショットを新規にセットする
                                    p = enemy[i].position.distance(chara.position);
                                    p.normalize();
                                    enemyShot[j].set(enemy[i].position, p, 5, 5);

                                    // ループを抜ける
                                    break;
                                }
                            }
                        }
                        ctx.closePath();
                    }
                }

                // 敵の色を指定する
                ctx.fillStyle = ENEMY_COLOR;

                // 敵を描く
                ctx.fill();

                // 敵のショットを描く
                ctx.beginPath();

                for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
                    if (enemyShot[i].alive) {
                        enemyShot[i].move();

                        ctx.arc(
                            enemyShot[i].position.x,
                            enemyShot[i].position.y,
                            enemyShot[i].size,
                            0, Math.PI * 2, false
                        );
                        ctx.closePath();
                    }
                }

                ctx.fillStyle = ENEMY_SHOT_COLOR;

                ctx.fill();

                // ボス -------------------------------------------------------
                // パスの設定を開始
                ctx.beginPath();

                // ボスの出現フラグをチェック
                if (boss.alive) {
                    // ボスを動かす
                    boss.move();

                    // ボスを描くパスを設定
                    ctx.arc(
                        boss.position.x,
                        boss.position.y,
                        boss.size,
                        0, Math.PI * 2, false
                    );

                    // パスをいったん閉じる
                    ctx.closePath();
                }

                // ボスの色を設定する
                ctx.fillStyle = BOSS_COLOR;

                // ボスを描く
                ctx.fill();

                // ビット -------------------------------------------
                // パスの設定を開始
                ctx.beginPath();

                // すべてのビットを調査する
                for (i = 0; i < BOSS_BIT_COUNT; i++) {
                    // ビットの出現フラグをチェック
                    if (bit[i].alive) {
                        // ビットを動かす
                        bit[i].move();

                        // ビットを描くパスを設定
                        ctx.arc(
                            bit[i].position.x,
                            bit[i].position.y,
                            bit[i].size,
                            0, Math.PI * 2, false
                        );

                        // ショットを打つかどうかパラメータの値からチェック
                        if (bit[i].param % 25 === 0) {
                            // エネミーショットを調査する
                            for (j = 0; j < ENEMY_SHOT_MAX_COUNT; j++) {
                                if (!enemyShot[j].alive) {
                                    // エネミーショットを新規にセットする
                                    p = bit[i].position.distance(chara.position);
                                    p.normalize();
                                    enemyShot[j].set(bit[i].position, p, 4, 1.5);

                                    // 1個出現させたのでループを抜ける
                                    break;
                                }
                            }
                        }

                        // パスをいったん閉じる
                        ctx.closePath();
                    }
                }

                // ビットの色を設定する
                ctx.fillStyle = BOSS_BIT_COLOR;

                // ビットを描く
                ctx.fill();


                // 衝突判定--------------------------------------
                for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
                    // 自機ショットの生存フラグをチェック
                    if (charaShot[i].alive) {
                        // 自機ショットとエネミーの衝突判定
                        for (j = 0; j < ENEMY_MAX_COUNT; j++) {
                            // エネミーの生存フラグをチェック
                            if (enemy[j].alive) {
                                // エネミーと自機ショットとの距離を計測
                                p = enemy[j].position.distance(charaShot[i].position);
                                if (p.length() < enemy[j].size) {
                                    // 衝突していたら生存フラグを降ろす
                                    enemy[j].alive = false;
                                    charaShot[i].alive = false;

                                    // スコアを更新するためにインクリメント
                                    score++;

                                    break;
                                }
                            }
                        }

                        // 自機ショットとボスビットとの衝突判定
                        for (j = 0; j < BOSS_BIT_COUNT; j++) {
                            // ビットの生存フラグをチェック
                            if (bit[j].alive) {
                                // ビットと自機ショットとの距離を計測
                                p = bit[j].position.distance(charaShot[i].position);
                                if (p.length() < bit[j].size) {
                                    // 衝突していたら耐久値をデクリメントする
                                    bit[j].life--;

                                    // 自機ショットの生存フラグを降ろす
                                    charaShot[i].alive = false;

                                    // 耐久値がマイナスになったら生存フラグを降ろす
                                    if (bit[j].life < 0) {
                                        bit[j].alive = false;
                                        score += 3;
                                    }

                                    // 衝突があったのでループを抜ける
                                    break;
                                }
                            }
                        }

                        // ボスの生存フラグをチェック
                        if (boss.alive) {
                            // 自機ショットとボスとの衝突判定
                            p = boss.position.distance(charaShot[i].position);
                            if (p.length() < boss.size) {
                                // 衝突していたら耐久値をデクリメントする
                                boss.life--;

                                // 自機ショットの生存フラグを降ろす
                                charaShot[i].alive = false;

                                // 耐久値がマイナスになったらクリア
                                if (boss.life < 0) {
                                    score += 10;
                                    run = false;
                                    message = 'CLEAR !!';
                                }
                            }
                        }
                    }
                }

                //  自機とエネミーショットとの衝突判定
                for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
                    // エネミーショットの生存フラグをチェック
                    if (enemyShot[i].alive) {
                        // 自機とエネミーショットとの距離を計測
                        p = chara.position.distance(enemyShot[i].position);
                        if (p.length() < chara.size) {
                            // 衝突していたら生存フラグを降ろす
                            chara.alive = false;

                            // 衝突があったのでパラメータを変更してループを抜ける
                            run = false;
                            message = 'GAME OVER !!';
                            break;
                        }
                    }
                }
                break;
        }

        info.innerHTML = 'SCORE: ' + (score * 100) + ' ' + message;

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
function OnButton() {
    location.reload();
}