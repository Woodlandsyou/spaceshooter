(()=> {
    const game = p => {
        const _width = 600, _height = 900;
        let enemys = [], player, timer = 0, score = 0, k = false, highscores, spawner, ms = 2000;;

        p.setup = () => {
            p.createCanvas(_width, _height);
            player = new Player(1);
            enemys.push(new Fighter(40, 4, 3));
            spawner = generateEnemys(ms);
            highscores = p.getItem('highscores') ? p.getItem('highscores'):[{ name: 'Herr Schooss', score: 5 },
                { name: 'Lukas', score: 4 }, 
                { name: 'Christopher', score: 3 }, 
                { name: 'Dymtro', score: 2 }, 
                { name: 'Leonard', score: 1 }];
            highscoreTable(highscores);
        }

        p.draw = () => {
            p.background(0);
            if(player.lives > 0) {
                if(document.hasFocus() && k) {
                    // if no new enemys are genrated generate new ones else continue doing so
                     spawner = !spawner ? generateEnemys(ms): spawner;

                    // draw enemys and move them
                    IterateArray(enemys, ['col', 'display', 'move']);

                    // draw bullets and detect any collisions with enemys
                    IterateArray(player.bullets, ['display', 'move']);

                    // if enemy is a Shooter display and move its bullets
                    enemys.forEach(e => {
                        if(e instanceof Shooter) {
                            e.inter = !e.inter ? e.generateBullets():e.inter;
                            IterateArray(e.bullets, ['display', 'move', 'hit']);
                        }
                    });

                    if(p.keyIsPressed || p.mouseIsPressed) timer++;
                } else {
                    // only draw enemys, bullets and enemy bullets
                    IterateArray(enemys, ['col', 'display']);
                    IterateArray(player.bullets, ['display']);
                    enemys.forEach(e => {
                        if(e instanceof Shooter) {
                            IterateArray(e.bullets, ['display']);
                            // stop generating new bullets
                            clearInterval(e.inter);
                            e.inter = undefined;
                        }
                    });
                }
        
                player.display();
                if(timer > 60) {
                    player.bullets.push(new Bullets(player.x, player.y - player.d / 2));
                    timer = 0;
                }

                drawScoreAndLives();
            } else drawDeathScreen();
        }

        p.keyReleased = () => {
            switch (p.keyCode) {
                case 8:
                    if(player.lives <= 0) {
                        compare(highscores, score);
                        location.reload();
                    }
                    break;
                case 75:
                    k = !k;
                    break;
                case 32:
                    if(k) player.bullets.push(new Bullets(player.x, player.y - player.d / 2));
                    timer = 0;
                    break;
            }
            
            p.keyCode = 0;
        }

        p.mouseClicked = () => {
            if(k) player.bullets.push(new Bullets(player.x, player.y - player.d / 2));
            
            timer = 0;
        }

        // call all methods specified in $methods on every object in array $arr log whole errors when log === true
        function IterateArray(arr, methods, log = false) {
            let errs = [];
            if(arr) {
                for (let i = 0; i < arr.length; i++) {
                    for (let j = 0; j < methods.length; j++) {
                        try {
                        arr[i][methods[j]]();
                        } catch (err) {
                            if(!log && errs.indexOf(err.name) < 0) errs.push(err.name);
                            else if(log) errs.push(err);
                            continue;
                        }
                    }
                }   
            }
            return errs;
        }

        function generateEnemys(ms) {
            return setTimeout(() => {

                switch (Math.floor(Math.random() * 4)) {
                    case 0:
                        enemys.push(new Fighter(40, p.random(-4, 4), p.random(4, 5)));
                        break;
                    case 1:
                        enemys.push(new Tank(50, p.random(-2, 2), p.random(2, 3), 4));
                        break;
                    case 2:
                        enemys.push(new Shooter(40, p.random(-3, 3), p.random(1, 2), 2));
                        break;
                    case 3:
                        enemys.push(new Speedy(20, p.random(-6, 6), p.random(6, 7)));
                        break;
                }
                
                if (document.hasFocus() && player.lives > 0 && k) {
                    ms = ms > 1200 ? ms - 100:1200;
                    console.log(ms);
                    generateEnemys(ms);
                } else spawner = undefined;
            }, ms);
        }

        function drawScoreAndLives() {
            p.textSize(_width / 15);
            p.fill(255);
            p.textAlign(p.LEFT);
            p.text(`❤ ${player.lives}`, _width / 20, _height / 20);
            p.textAlign(p.RIGHT);
            p.text(`Ur score: ${score}`, _width - _width / 20, _height / 20);
        }

        function drawDeathScreen() {
            p.fill(255, 15, 0);
            p.textSize(50);
            p.textAlign(p.CENTER);
            p.text('U Lost xD', _width / 2, _height / 2);
            p.text(`Ur Score: ${score}`, _width / 2, _height / 2 + 100);
        }

        function compare(scores, score) {
            for (let i = 0; i < scores.length; i++) {
                const e = scores[i];
                
                if(score > e.score) {
                    let name = prompt('Wähle einen Namen');
                    scores.splice(i, 0, {name: name, score: score});
                    scores.pop();
                    p.storeItem('highscores', scores);

                    return true;
                }
            }
            return false;
        }

        function highscoreTable(scores) {
           for (let i = 0; i < scores.length; i++) {
                const e = scores[i];
            
                const table = document.getElementById('highsocreTable');
                const tr = document.createElement('tr');
                const rank = document.createElement('td');
                const score = document.createElement('td');
                const name = document.createElement('td');
                rank.innerHTML = `#${i + 1}`;
                score.innerHTML = e.score;
                name.innerHTML = e.name;
                tr.appendChild(rank);
                tr.appendChild(score);
                tr.appendChild(name);
                table.appendChild(tr);
           }
        }

        class Player {
            constructor(lives) {
                this.d = _width / 12;
                this.x = p.mouseX;
                this.y = _height - _height / 8;
                this.bullets = [];
                this.lives = lives;
            }

            display() {
                p.rectMode(p.CENTER);
                this.x = p.mouseX;
                if(this.x > _width - this.d / 2) this.x = _width - this.d / 2;
                else if(this.x < this.d / 2) this.x = this.d / 2;
                p.fill(150, 0, 255);
                p.rect(this.x, this.y, this.d);
            }
        }

        class Bullets {
            constructor(x, y, d = 6, speed = 7) {
                this.x = x;
                this.y = y;
                this.d = d;
                this.speed = speed;
            }

            display() {
                if(this.y < 0) player.bullets.splice(player.bullets.indexOf(this), 1);
                p.fill(0, 255, 0);
                p.rect(this.x, this.y, this.d, this.d * 2);
            }

            move() {
                this.y -= this.speed;
            }
        }

        class EnemyBullet extends Bullets {
            constructor(x, y, d, speed, parent) {
                super(x, y, d, speed);
                this.bullets = parent.bullets;
            }

            display() {
                if(this.y > _height) this.bullets.splice(this.bullets.indexOf(this), 1);
                p.fill(255, 50, 0);
                p.rect(this.x, this.y, this.d, this.d * 2);
            }

            hit() {
                    if(p.dist(this.x, this.y, player.x, player.y) < (this.d + player.d) / 2) {
                        player.lives--;
                        this.bullets.splice(this.bullets.indexOf(this), 1);
                    }
            }
        }

        class Fighter {
            constructor(d, xv, yv, lives = 1) {
                this.d = d;
                this.x = p.random(this.d / 2, _width - this.d / 2);
                this.y = this.d;
                this.xv = xv;
                this.yv = yv;
                this.lives = lives;
                this.maxLives = lives;
            }

            display() {
                p.circle(this.x, this.y, this.d);
            }

            hit() {
                if((this.y > player.y || p.dist(this.x, this.y, player.x, player.y) < (this.d / 2 + player.d / 2))) {
                    player.lives--;
                    this.lives = 0;
                } else {
                    for (let i = 0; i < player.bullets.length; i++) {
                        const e = player.bullets[i];
                        if(p.dist(e.x, e.y, this.x, this.y) < (this.d + e.d) / 2) {
                            this.lives--;
                            player.bullets.splice(i, 1);
                        }
                        
                    }
                }
                if(this.lives < 1) {
                    enemys.splice(enemys.indexOf(this), 1);
                    score++;
                }
            }

            move() {
                this.x += this.xv;
                this.y += this.yv;

                if(this.x + this.d / 2 > _width) this.xv *= -1;
                else if(this.x - this.d / 2 < 0) this.xv *= -1;

                this.hit();
            }

            col() {
                let col = p.map(this.lives, 0, this.maxLives, 190, 255);
                p.fill(col, 0, 0);
            }
        }

        class Tank extends Fighter {
            constructor(d, xv, yv, lives) {
                super(d, xv, yv, lives);
                this.rotate = 0;
            }

            display() {
                const xoff = this.d / 2 / 2, yoff = Math.sqrt(this.d / 2 * this.d / 2 * 0.75);
                // draws hexagon
                p.beginShape()
                p.vertex(this.x - xoff, this.y - yoff);
                p.vertex(this.x + xoff, this.y - yoff);
                p.vertex(this.x + this.d / 2, this.y);
                p.vertex(this.x + xoff, this.y + yoff);
                p.vertex(this.x - xoff, this.y + yoff);
                p.vertex(this.x - this.d / 2, this.y);
                p.endShape();
            }
        }

        class Speedy extends Fighter {
            constructor(d, xv, yv) {
                super(d, xv, yv);
            }

            display() {
                const xOff = (Math.sqrt(3) * this.d) / 2;
                // draw triangle
                p.beginShape();
                p.vertex(this.x - xOff, this.y - this.d / 2);
                p.vertex(this.x + xOff, this.y - this.d / 2);
                p.vertex(this.x, this.y + this.d);
                p.endShape();
            }
        }

        class Shooter extends Fighter {
            constructor(d, xv, yv, lives, shootinFreq = 1000) {
                super(d, xv, yv, lives);
                this.bullets = [];
                this.shootinFreq = shootinFreq;
                this.inter = this.generateBullets();
            }

            display() {
                p.push();
                p.translate(this.x, this.y);
                p.rectMode(p.CENTER);
                p.rotate(Math.PI / 4);
                p.rect(0, 0, this.d);
                p.pop();
            }

            generateBullets() {
                return setInterval(() => {
                    this.bullets.push(new EnemyBullet(this.x, this.y, 6, (this.yv + 2) * -1, this));
                }, this.shootinFreq);
            }
        }
    };
    new p5(game);
})()