// 自機関連

// 弾クラス
class Tama extends CharaBase {
    constructor(x, y, vx, vy) {
        super(5, x, y, vx, vy);
        this.r = 4;
    }

    update() {
        super.update();

        for (let i = 0; i < teki.length; i++) {
            if (!teki[i].kill) {
                if (checkHit(
                    this.x, this.y, this.r,
                    teki[i].x, teki[i].y, teki[i].r

                )) {
                    this.kill = true;

                    if ((teki[i].hp -= 10) <= 0) {
                        teki[i].kill = true;

                        explosion(
                            teki[i].x, teki[i].y,
                            teki[i].vx >> 3, teki[i].vy >> 3);
                        score += teki[i].score;
                    }
                    else {
                        expl.push(new Expl(0, teki[i].x, teki[i].y, 0, 0))
                    }
                    break;
                }
            }
        }
    }

    draw() {
        super.draw();
    }
}

// 自機クラス
class Jiki {
    constructor() {
        this.x = (FIELD_W / 2) << 8;
        this.y = (FIELD_H - 100) << 8;
        this.speed = 512;
        this.anime = 0;
        this.reload = 0;
        this.relo2 = 0;
        this.r = 10;
        this.damage = 0;
        this.muteki = 0;
        this.count = 0;
        this.fire = false;
        this.mhp = 100;
        this.hp = this.mhp;

        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;
    }

    // 自機の移動
    update() {
        this.count++;
        if (this.damage) this.damage--;
        if (this.muteki) this.muteki--;

        // if (key['Space'] && this.reload == 0) {
        //     tama.push(new Tama(this.x + (6 << 8), this.y - (10 << 8), 0, -2000));
        //     tama.push(new Tama(this.x - (6 << 8), this.y - (10 << 8), 0, -2000));
        //     tama.push(new Tama(this.x + (8 << 8), this.y - (5 << 8), 200, -2000));
        //     tama.push(new Tama(this.x - (8 << 8), this.y - (5 << 8), -200, -2000));

        //     this.reload = 4;
        //     if (++this.relo2 == 4) {
        //         this.reload = 20;
        //         this.relo2 = 0;
        //     }
        // }
        // if (!!key['Spece']) this.reload = this.relo2 = 0;


        if (this.fire === true && this.reload == 0) {
            tama.push(new Tama(this.x + (6 << 8), this.y - (10 << 8), 0, -2000));
            tama.push(new Tama(this.x - (6 << 8), this.y - (10 << 8), 0, -2000));
            tama.push(new Tama(this.x + (8 << 8), this.y - (5 << 8), 200, -2000));
            tama.push(new Tama(this.x - (8 << 8), this.y - (5 << 8), -200, -2000));

            this.reload = 4;
            if (++this.relo2 == 4) {
                this.reload = 20;
                this.relo2 = 0;
            }
        }
        if (this.fire === false) this.reload = this.relo2 = 0;


        if (this.reload > 0) this.reload--;
        if (this.left && this.x > this.speed || key['ArrowLeft'] && this.x > this.speed) {
            this.x -= this.speed;
            if (this.anime > -8) this.anime--;
        } else if (this.right && this.x <= (FIELD_W << 8) - this.speed || key['ArrowRight'] && this.x <= (FIELD_W << 8) - this.speed) {
            this.x += this.speed;
            if (this.anime < 8) this.anime++;
        } else {
            if (this.anime > 0) this.anime--;
            if (this.anime < 0) this.anime++;
        }

        if (this.up && this.y > this.speed || key['ArrowUp'] && this.y > this.speed) this.y -= this.speed;

        if (this.down && this.y <= (FIELD_H << 8) - this.speed || key['ArrowDown'] && this.y <= (FIELD_H << 8) - this.speed)
            this.y += this.speed;
    }

    // 描画
    draw() {
        if (this.muteki && (this.count & 5)) return;
        drawSprite(2 + (this.anime >> 2), this.x, this.y);

        if (this.count & 1) return;
        drawSprite(9 + (this.anime >> 2), this.x, this.y + (24 << 8));
    }
}