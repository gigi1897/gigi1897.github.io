var url_string = window.location.href;
var url = new URL(url_string);
var gameOverOnce = false;
const jsonPath = "ressources/json/hero1Config.json";
var hero = deserialiseJSON(jsonPath);
hero.name = url.searchParams.get("player1name");
document.getElementById("p1").innerHTML = hero.name;

const jsonPathHero2 = "ressources/json/hero2Config.json";
var hero2 = deserialiseJSON(jsonPathHero2);
hero2.name = url.searchParams.get("player2name");
document.getElementById("p2").innerHTML = hero2.name;

hero.sprite = url.searchParams.get("image1");
hero2.sprite = url.searchParams.get("image2");

hero.getstats = function getstats () {
    for(let stat in this.stats){
        document.getElementById(stat+"1").innerHTML = this.stats[stat];
    }
};

hero2.getstats = function getstats () {
    for(let stat in this.stats){
        document.getElementById(stat+"2").innerHTML = this.stats[stat];
    }
};

//local storage
userJSON = localStorage.getItem(hero.name);
if(userJSON != null){
    heroTmp = JSON.parse(userJSON);

    if(heroTmp != null)
        hero.stats = heroTmp.stats;
}else{
    localStorage.setItem(hero.name, JSON.stringify(hero));
}

userJSON2 = localStorage.getItem(hero2.name);
if(userJSON != null){
    heroTmp2 = JSON.parse(userJSON2);

    if(heroTmp2 != null)
        hero2.stats = heroTmp2.stats;

}else{
    localStorage.setItem(hero2.name, JSON.stringify(hero2));
}


var cptAnim = 0;
// Create the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 545;
canvas.height = 446;

var mapheight = canvas.height; //416px
var mapwidth = canvas.width; //545 px

//images des bonus
//image bonus vitesse
var b_speedReady = false;
var b_speedImage = new Image();
b_speedImage.onload = function () {
    b_speedReady = true;
};
b_speedImage.src = "ressources/images/bonuses/speed.png";

//image bonus damage
var b_damagedReady = false;
var b_damageImage = new Image();
b_damageImage.onload = function () {
    b_damagedReady = true;
};
b_damageImage.src = "ressources/images/bonuses/damage.png";

//image bonus addbomb
var b_addbombReady = false;
var b_addbombImage = new Image();
b_addbombImage.onload = function () {
    b_addbombReady = true;
};
b_addbombImage.src = "ressources/images/bonuses/more.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};

var imageWidth = 240;
var imageHeight = 36;
var frameWidth = 24;
var frameHeight = 24;

heroImage.src = "ressources/images/"+hero.sprite+".png";



// Hero image
var hero2Ready = false;
var hero2Image = new Image();
hero2Image.onload = function () {
    hero2Ready = true;
};
hero2Image.src = "ressources/images/"+hero2.sprite+".png";


var lifeReady = false;
var lifeImage = new Image();
lifeImage.onload = function (){
    lifeReady = true;
};
lifeImage.src = "ressources/images/life.png";

var DeadLifeReady = false;
var DeadLifeImage = new Image();
DeadLifeImage.onload = function (){
    DeadLifeReady = true;
};
DeadLifeImage.src = "ressources/images/noLife.png";

//var current_state = 'down';
//var current_frame = 0;
var gameover = false;

var animations = {
    down: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
    left: [{x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}],
    right: [{x: 6, y: 0}, {x: 7, y: 0}, { x: 8, y: 0}],
    up: [{x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0}],};

//gazonbom Image
var grassReady = false;
var grassImage = new Image();
grassImage.onload = function () {
    grassReady = true;
}
grassImage.src = "ressources/images/grass.png";


//blocs indestructibles Image
var blocReady = false;
var blocImage = new Image();
blocImage.onload = function () {
    blocReady = true;
}
blocImage.src = "ressources/images/indestructible.png";


//bloc destructible Image
var blocdestructibleReady = false;
var blocdestructibleImage = new Image();
blocdestructibleImage.onload = function () {
    blocdestructibleReady = true;
}
blocdestructibleImage.src = "ressources/images/destructible.png";


// Bombe Image
var bombReady = false;
var bombImage = new Image();
bombImage.onload = function () {
    bombReady = true;
};
bombImage.src = "ressources/images/labombe.png";

// Explosion Image
var explosionReady = false;
var explosionImage = new Image();
explosionImage.onload = function () {
    explosionReady = true;
};
explosionImage.src = "ressources/images/explosion.png";

const distance = 32;

var tabXY;

//indice matrice
//0 => nothing
//1 => indestructible bloc
//2 => destrusctible bloc
//3 => bonus de vitesse !
//4 = >bonus de rayon d'explosion !
//5 = >bonus...
//6 => bonus de vitesse !
//7 = >bonus de dégât !
//8 = >bonus de rayon d'explosion !
//9 => bombe

// index                  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
const indestructibleMap = [
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], //0
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
                        [1, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1], // 2
                        [1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1], // 3
                        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 4
                        [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1], // 5
                        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 6
                        [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1], // 7
                        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 8
                        [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1], // 9
                        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 10
                        [1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1], // 11
                        [1, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1], // 12
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];// 13


(function placeBonus() {
    for (var k = 3; k <= 4; k++) {
        for (var j = 0; j < 6; j++) {
            let aleaX = Math.floor(Math.random() * 11) + 3;
            let aleaY = Math.floor(Math.random() * 7) + 3;

            if (indestructibleMap[aleaY][aleaX] === 1)
                aleaY += 1;
            else
                indestructibleMap[aleaY][aleaX] = k;
        }
    }

}());


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

function explosion(colonne, ligne, heroObj, heroSec) {
    //haut - droite - bas - gauche
    let col = [0, 1, 0, -1];
    let lig = [-1, 0, 1, 0];



    tabXY = GetHeroXY(heroObj);

    let numblocX = tabXY[0];
    let numblocY = tabXY[1];



    tabXY = GetHeroXY(heroSec);

    let numblocXSec = tabXY[0];
    let numblocYSec = tabXY[1];


    //joueur est sur la bombe
    if (ligne === numblocY && colonne === numblocX || ligne === numblocYSec && colonne === numblocXSec) {
        heroObj.cptLife--;
        if(heroObj.cptLife<1)
            GameOver();
    }

    indestructibleMap[ligne][colonne] = 11;

    loop1: for (let j = 0; j < 4; j++) {
        let i = 1;
        loop2: do {
            //c'est un bloc indestructible, on sort de la boucle
            if ((indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 1) ||
                (indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 9)) {
                break;
            }

            //c'est une bloc destructible sans bonus derrière, on le casse
            else if (indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 2) {
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] = 11;
                i++;
                heroObj.stats.explosedBloc++;
            }
            //joueur est dans le rayon de la bombe
            else if (ligne + (1 * i * lig[j]) === numblocY && colonne + (1 * i * col[j]) === numblocX) {

                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] = 11;

                heroObj.cptLife--;

                if(heroObj.cptLife<1)
                    GameOver();
                i++;
            }
            else if(ligne + (1 * i * lig[j]) === numblocYSec && colonne + (1 * i * col[j]) === numblocXSec){
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] = 11;

                heroSec.cptLife--;

                if(heroSec.cptLife<1)
                    GameOver();
                i++;
            }
            //c'est du gazon, on étend le rayon de l'explosion
            else if (indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 0 ||
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 6 ||
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 7) {
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] = 11;
                i++;
            }

            //si c'est un bonus, on remplace par le bonus affiche
            else if (indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 3) {
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] = 6;
                i++;
                heroObj.stats.explosedBloc++;
            }

            //si c'est un bonus, on remplace par le bonus affiche
            else if (indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] === 4) {
                indestructibleMap[ligne + (1 * i * lig[j])][colonne + (1 * i * col[j])] = 7;
                i++;
                heroObj.stats.explosedBloc++;
            } else {
                break;
            }
        } while (i <= heroObj.rayon);
    }
};

function GameOver(){
    if (!gameOverOnce){
        gameOverOnce = true;
        gameover = true;
    document.getElementById("canvas").style.display = "none";
    document.getElementById("Instructionsright").style.display = "none";
    document.getElementById("Instructionsleft").style.display = "none";

    let div = document.createElement("div");
    div.id = "container";
    document.getElementById("gameDiv").appendChild(div);
    let h1 = document.createElement("h1");
    h1.id = "gameOver";
    div.appendChild(h1);
    document.getElementById("gameOver").innerHTML = "Game Over !";
    let h3 = document.createElement("h3");
    h3.id = "infoGameOver";
    div.appendChild(h3);
    document.getElementById("infoGameOver").innerHTML = "Click on the screen to see stats";


    document.onclick= function(event) {
        if($('#PlayerStats').css('display') === 'none'){
            window.location.href = "#stats";
            document.getElementById("PlayerStats").style.display = "block";
            document.getElementById("sp1").innerHTML = hero.name;
            document.getElementById("sp2").innerHTML = hero2.name;

            var image = document.createElement("img");
            image.src = "ressources/images/sprites/"+hero.sprite+".png";
            document.getElementById("imagePlayer1").appendChild(image);
            image.height = "40";

            var image2 = document.createElement("img");
            image2.src = "ressources/images/sprites/"+hero2.sprite+".png";
            document.getElementById("imagePlayer2").appendChild(image2);
            image2.height = "40";

            document.getElementById("cptLife1").innerHTML = 3 - hero.cptLife;
            document.getElementById("cptLife2").innerHTML = 3 - hero2.cptLife;

            localStorage.setItem(hero.name, JSON.stringify(hero));
            localStorage.setItem(hero2.name, JSON.stringify(hero2));

            hero.getstats();
            hero2.getstats();

            var script = document.createElement("script");  // create a script DOM node
            script.src = "ressources/js/location.js";  // set its src to the provided URL

            document.head.appendChild(script);
        }
};

        }
};

function getBonus(heroObj) {

    //teste la position du joueur sur la matrice
    tabXY = GetHeroXY(heroObj);

    let index_colonne = tabXY[0];
    let index_ligne = tabXY[1];


    if (indestructibleMap[index_ligne][index_colonne] === 6 || indestructibleMap[index_ligne][index_colonne] === 7) {
        let bonuSound = new Audio("ressources/sound/bonus.mp3");
        bonuSound.play();

        if (indestructibleMap[index_ligne][index_colonne] === 6) {
            //incrémente le cpt bonus speed
            heroObj.stats.bonusSpeed++;
            console.log("cpt speed: " + heroObj.bonusSpeed);
            indestructibleMap[index_ligne][index_colonne] = 0; //on la fait depop
            heroObj.speed += 25;
        } else {
            //incrémente le cpt bonus rayon
            heroObj.stats.bonusRayon++;
            console.log("cpt rayon: " + heroObj.bonusRayon);
            indestructibleMap[index_ligne][index_colonne] = 0; //on la fait depop
            heroObj.rayon += 1; //on augmente le rayon d'explosion de la bombe
        }
    }
};

function GetHeroXY (heroObj) {
    //0 = x / 1 = y
    let tab = [];

    tab[0] = parseInt((heroObj.x + heroObj.middlePos) / distance);
    tab[1] = parseInt((heroObj.y + heroObj.middlePos) / distance);

    return tab;
}

function droppBomb(heroObj, heroSec) {

    if (!heroObj.droppedBomb) {
        console.log(heroObj);
        //incrementation du cpt depose bomb
        heroObj.stats.deposedBomb++;
        console.log(hero.deposedBomb);
        heroObj.droppedBomb = true;

        tabXY = GetHeroXY(heroObj);

        let numblocX = tabXY[0];
        let numblocY = tabXY[1];

        //place bomb on the matrice
        indestructibleMap[numblocY][numblocX] = 9;

        //wait 3 second before explosion
        setTimeout(function () {
            if (!(indestructibleMap[numblocY][numblocX] === 0)) {
                explosion(numblocX, numblocY, heroObj, heroSec);
                if(!gameover){
                    heroObj.droppedBomb = false;

                    //sound explosion
                    let bombExplosion = new Audio("ressources/sound/8bitbomb.mp3");
                    bombExplosion.play();
                }
            }
        }, 3000);
    }
};

// Update game objects
var update = function (modifier) {

    let XBefore = hero.x;
    let YBefore = hero.y;

    let XBefore2 = hero2.x;
    let YBefore2 = hero2.y;

    if (38 in keysDown) { // Player holding up
        hero2.current_state = 'up';
        hero2.y -= hero2.speed * modifier;
    }
    if (37 in keysDown) { // Player holding left
        hero2.current_state = 'left';
        hero2.x -= hero2.speed * modifier;
    }
    if (40 in keysDown) { // Player holding down
        hero2.current_state = 'down';
        hero2.y += hero2.speed * modifier;
    }
    if (39 in keysDown) { // Player holding right
        hero2.current_state = 'right';
        hero2.x += hero2.speed * modifier;
    }




    //---------------------------------------------------------
    if (87 in keysDown) { // Player holding up
        hero.current_state = 'up';
        hero.y -= hero.speed * modifier;
    }
    if (65 in keysDown) { // Player holding left
        hero.current_state = 'left';
        hero.x -= hero.speed * modifier;
    }
    if (83 in keysDown) { // Player holding down
        hero.current_state = 'down';
        hero.y += hero.speed * modifier;
    }
    if (68 in keysDown) { // Player holding right
        hero.current_state = 'right';
        hero.x += hero.speed * modifier;
    }


    if (32 in keysDown) {
        droppBomb(hero2, hero);
    }

    if (16 in keysDown) {
        droppBomb(hero, hero2);
    }

    getBonus(hero);
    getBonus(hero2);

    checkCollision(XBefore, YBefore, hero);
    checkCollision(XBefore2, YBefore2, hero2);

};

// Draw everything
var render = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Place le décor
    if (blocdestructibleReady && blocReady && grassReady && b_speedReady) {
        let AxeX = 0;
        let AxeY = 0;

        for (let i = 0; i < indestructibleMap.length; i++) {

            for (let j = 0; j < indestructibleMap[0].length; j++) {

                switch (indestructibleMap[i][j]) {
                    case 0:
                        ctx.drawImage(grassImage, AxeX, AxeY);
                        break;
                    case 1:
                        ctx.drawImage(blocImage, AxeX, AxeY);
                        break;
                    case 2:
                    case 3:
                    case 4:
                        ctx.drawImage(blocdestructibleImage, AxeX, AxeY);
                        break;
                    case 6:
                        ctx.drawImage(b_speedImage, AxeX, AxeY);
                        break;
                    case 7:
                        ctx.drawImage(b_damageImage, AxeX, AxeY);
                        break;
                        //la bombe
                    case 9:
                        ctx.drawImage(bombImage, AxeX, AxeY);
                        break;
                        //explosion
                    case 11:
                        ctx.drawImage(grassImage, AxeX, AxeY);
                        ctx.drawImage(explosionImage, AxeX, AxeY);
                        timerExplosion();
                        break;
                }
                AxeX += distance;
            }
            AxeY += distance;
            AxeX = 0;
        }
    }
    ctx.clearRect(0,0,545, 32);


    //vies du joueur 1
    ctx.fillStyle = 'black';
	ctx.font = "26px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "Middle";
    let cpt = 3;
    for(let i=hero.cptLife;i>0;i--){
        ctx.drawImage(lifeImage, cpt, 5);
        cpt += 27;
    }
    for(let i=0;i<3-hero.cptLife;i++){
        ctx.drawImage(DeadLifeImage,cpt,5);
        cpt +=27;
    }



    //vies du joueur 1
    ctx.fillStyle = 'black';
	ctx.font = "26px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "Middle";
    let cpt2 = 463;
    for(let i=hero2.cptLife;i>0;i--){
        ctx.drawImage(lifeImage, cpt2, 5);
        cpt2 += 27;
    }
    for(let i=0;i<3-hero2.cptLife;i++){
        ctx.drawImage(DeadLifeImage,cpt2,5);
        cpt2 +=27;
    }

    cptAnim++;
    if(cptAnim === 20){
        ctx.drawImage(heroImage, animations[hero.current_state][hero.current_frame].x * frameWidth, animations[hero.current_state][hero.current_frame].y * frameHeight, frameWidth, frameHeight, hero.x, hero.y, frameWidth, frameHeight);
        hero.current_frame += 1;
        if (hero.current_frame > 2) {
            hero.current_frame = 0;
        }
    }else{
        ctx.drawImage(heroImage, animations[hero.current_state][hero.current_frame].x * frameWidth, animations[hero.current_state][hero.current_frame].y * frameHeight, frameWidth, frameHeight, hero.x, hero.y, frameWidth, frameHeight);
    }


    //Draw hero 2
    if(cptAnim === 20){
        cptAnim=0;
        ctx.drawImage(hero2Image, animations[hero2.current_state][hero2.current_frame].x * frameWidth, animations[hero2.current_state][hero2.current_frame].y * frameHeight, frameWidth, frameHeight, hero2.x, hero2.y, frameWidth, frameHeight);
        hero2.current_frame += 1;
        if (hero2.current_frame > 2) {
            hero2.current_frame = 0;
        }
    }else{
        ctx.drawImage(hero2Image, animations[hero2.current_state][hero2.current_frame].x * frameWidth, animations[hero2.current_state][hero2.current_frame].y * frameHeight, frameWidth, frameHeight, hero2.x, hero2.y, frameWidth, frameHeight);
    }
};

function timerExplosion(){
    setTimeout(function(){
        for (let i = 0; i < indestructibleMap.length; i++) {
            for (let j = 0; j < indestructibleMap[0].length; j++) {
                if(indestructibleMap[i][j] === 11)
                    indestructibleMap[i][j] = 0;
            }
        }
    },350);
}

function deserialiseJSON(file) {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': file,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
};

function checkCollision(XBefore, YBefore, heroObj) {
    //mur droite
    if (heroObj.x + 24 >= 513) //545-32
        heroObj.x = 489; //545-(32+24) on fige le mouvement du joueur

    //mur gauche
    if (heroObj.x <= distance)
        heroObj.x = distance;

    //plafond
    if (heroObj.y <= distance*2)
        heroObj.y = distance*2;

    //bas de la map
    if (heroObj.y >= 388)
        heroObj.y = 388;

    //détection de collision avec les blocs indestructibles et destructibles
    for (var i = 64; i < mapwidth - 64; i = i + 64) {
        for (var j = 96; j < mapheight - 64; j = j + 64) {
            var blocloop = {};
            blocloop.x = i;
            blocloop.y = j;
            if (heroObj.x <= (blocloop.x + distance) && blocloop.x <= (heroObj.x + heroObj.heigthPx) && heroObj.y <= (blocloop.y + 32) && blocloop.y <= (heroObj.y + heroObj.heigthPx)) {
                heroObj.x = XBefore;
                heroObj.y = YBefore;
            }
        }
    }
    let AxeX = 32;
    let AxeY = 0;
    for (i = 0; i < indestructibleMap.length; i++) {
        for (j = 0; j < indestructibleMap[0].length; j++) {
            var blocdes = {};
            blocdes.x = AxeX;
            blocdes.y = AxeY;
            if (indestructibleMap[i][j] === 2) {
                if (heroObj.x <= (blocdes.x + distance) && blocdes.x <= (heroObj.x + heroObj.heigthPx) && heroObj.y <= (blocdes.y + 32) && blocdes.y <= (heroObj.y + heroObj.heigthPx)) {
                    heroObj.x = XBefore;
                    heroObj.y = YBefore;
                }
            }
            if (indestructibleMap[i][j] === 3 || indestructibleMap[i][j] === 4) {
                if (heroObj.x <= (blocdes.x + distance) && blocdes.x <= (heroObj.x + heroObj.heigthPx) && heroObj.y <= (blocdes.y + 32) && blocdes.y <= (heroObj.y + heroObj.heigthPx)) {
                    heroObj.x = XBefore;
                    heroObj.y = YBefore;
                }
            }
            if ((indestructibleMap[i][j] === 9) && (heroObj.bloque)) {
                if (heroObj.x <= (blocdes.x + 32) && blocdes.x <= (heroObj.x + 23) && heroObj.y <= (blocdes.y + 32) && blocdes.y <= (heroObj.y + 23)) {
                    heroObj.x = XBefore;
                    heroObj.y = YBefore;
                }
            }
            AxeX += 32;
        }
        AxeY += 32;
        AxeX = 0;
    }
};

// The main game loop
var main = function () {
    if (!gameover){
        var now = Date.now();
        var delta = now - then;

        update(delta / 1000);
        render();
        then = now;
        // Request to do this again ASAP
        requestAnimationFrame(main);
    }
};


// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
main();
