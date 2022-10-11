function Point(){
    this.x = 0;
    this.y = 0;
}

Point.prototype.distance = function(p){
    let q = new Point();
    q.x = p.x - this.x;
    q.y = p.y - this.y;
    return q;
};

Point.prototype.lenght = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point.prototype.normalize = function(){
    let i = this.lenght();
    if(i > 0){
        let j = 1 / i;
        this.x *= j;
        this.y *= j;
    }
};