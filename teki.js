// 敵関連

// 敵弾クラス
class Teta extends CharaBase{
    
}

// 敵クラス
class Teki extends CharaBase{
    constructor(snum, x, y, vx, vy) {
      super(snum, x, y, vx, vy);
      this.flag = false;
    }
  
    update() {
      super.update();

      if(!this.flag){
        if(jiki.x > this.x && this.vx < 120) this.vx += 4;
        else if(jiki.x < this.x && this.vx >- 120) this.vx -= 4;
      }

      else{
        if(jiki.x < this.x && this.vx < 400)this.vx += 30;
        else if(jiki.x > this.x && this.vx >-400)this.vx -= 30;
      }
      

      if(Math.abs(jiki.y - this.y) < (100<<8) && !this.flag){
        this.flag = true;

        let an, dx, dy;
        an = Math.atan2(jiki.y - this.y, jiki.x - this.x);

        dx = Math.cos(an) * 1000;
        dy = Math.sin(an) * 1000;

        teta.push(new Teta(15, this.x, this.y, dx, dy))
      }

      if(this.flag && this.vy > -800) this.vy -= 30;
    }
  
    draw() {
      super.draw();
    }
  }