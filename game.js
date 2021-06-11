// VK

var user = {
	id:0,
	totalScore: 0,
	highScore: 0,
	boughtSpaceships:"snnn" //selected, not bought, bought
}

vkBridge.send("VKWebAppInit", {});

vkBridge
	.send('VKWebAppGetUserInfo', {})
	.then(data => {
		user.id = data.id;
	})
	.catch(error => {
		console.log(error);
	});

//vkBridge.send("VKWebAppGetAuthToken", {"app_id": 7571672, "scope": ""})
//	.then(data => {
//		user.accessToken = data.access_token;
//		console.log(data);
//	})
//	.catch(error => {
//		console.log(error);
//	});

function loadSaves(){
	function checkIsNumber(x) {
	  	if (isNaN(parseInt(x))){
	  		return 0;
	  	}
	  	else{
	  		return parseInt(x);
	  	}
	}

	function checkIsSaves(x){
		if(x){
			while(x < user.boughtSpaceships.length){
				x+='n';
			}
			return x;
		}
		else{
			return user.boughtSpaceships;
		}
	}

	vkBridge.send("VKWebAppStorageGet", {"keys": ["totalScore", "highScore", "boughtSpaceships"]})
		.then(data => {
			console.log(data);

  			user.totalScore = checkIsNumber(data.keys[0].value);
  			user.highScore = checkIsNumber(data.keys[1].value);
  			user.boughtSpaceships = checkIsSaves(data.keys[2].value);

			total = user.totalScore;
			highScore = user.highScore;
		})
		.catch(error => {
			console.log(error);
		});
}

function saveSaves(){
	vkBridge.send("VKWebAppStorageSet", {"key": "totalScore", "value": user.totalScore.toString()})
		.then(data => {
			console.log("Success!");
		})
		.catch(error => {
			console.log("Something went wrong");
		});

	vkBridge.send("VKWebAppStorageSet", {"key": "highScore", "value": user.highScore.toString()})
		.then(data => {
			console.log("Success!");
		})
		.catch(error => {
			console.log("Something went wrong");
		});

	vkBridge.send("VKWebAppStorageSet", {"key": "boughtSpaceships", "value": user.boughtSpaceships})
		.then(data => {
			console.log("Success!");
		})
		.catch(error => {
			console.log("Something went wrong");
		});
}

//function saveRecord(){
//	vkBridge.sendPromise("VKWebAppCallAPIMethod", {
//        "method": "secure.addAppEvent",
//        "params": {
//            "user_id": user.id,
//            "v":"5.122",
//            "activity_id": 2,
//            "value": user.highScore,
//            "access_token": user.accessToken,
//            "client_secret": null
//        }
//    })
//    	.then(data => {
//			console.log(data);
//		})
//		.catch(error => {
//			console.log(error);
//		});;
//}

function shareRecordClick(){
	vkBridge.send("VKWebAppShowWallPostBox", {"message": "У меня новый рекорд в игре Космическая битва!\nМой новый рекорд: " + user.highScore + "! Присоединись: https://vk.com/app7571672"} );
}

function shareRecord(){

}

function leadersClick(){
	vkBridge.sendPromise("VKWebAppShowLeaderBoardBox", {user_result:highScore})
		.then(data => console.log(data.success))
        .catch(error => console.log(error));
}

loadSaves();
console.log(user);

// GAME

const cnvs = document.getElementById("main-canvas"),
	ctx     = cnvs.getContext('2d');

cnvs.height = window.innerHeight;
cnvs.width = cnvs.height/2;

document.getElementById("main-body").width = window.innerWidth;
document.getElementById("main-body").height = window.innerHeight;

ctx.font = "35px Roboto";

const shopButton = document.getElementById("shop-bttn");
const replayButton = document.getElementById("replay-bttn");
const backButton = document.getElementById("back-bttn");
const shareButton = document.getElementById("share-bttn");
const shopPannel = document.getElementById("shop-pannel");

shopPannel.width = cnvs.width;
shopPannel.height = cnvs.height;

const buyButtons = [];

for(let i = 0; i < 4; i++){
	buyButtons.push(document.getElementById("button-buy-" + i.toString()));
}

const spaceship0Img = new Image();
spaceship0Img.src = "graphics/spaceship.png";

const spaceship1Img = new Image();
spaceship1Img.src = "graphics/spaceship-pink.png";

const spaceship2Img = new Image();
spaceship2Img.src = "graphics/spaceship-green.png";

const spaceship3Img = new Image();
spaceship3Img.src = "graphics/spaceship-violet.png";

const meteoriteImg = new Image();
meteoriteImg.src = "graphics/meteorite.png";

const coinImg = new Image();
coinImg.src = "graphics/coin.png";

var spaceship = {
	enable: true,
	x: cnvs.width/2.0,
	y: cnvs.height/2.0,
	w: cnvs.width*0.18,
	h: cnvs.width*0.18,
	directionRight : true,
	speed: cnvs.width/90*0.7,
	img : spaceship0Img,
	draw: () => {
		ctx.drawImage(spaceship.img, spaceship.x - spaceship.w/2, spaceship.y - spaceship.h/2, spaceship.w, spaceship.h);
	}
};

function Meteorite() {
	this.enable = false;
	this.x = getRandomInt(cnvs.width);
	this.y = -cnvs.width/8;
	this.w = cnvs.width/8;
	this.h = cnvs.width/8;
	this.direction = { x:0, y:0 };
	this.angle = getRandomInt(360);
	this.speed = cnvs.width/90*0.8;
	this.rotationSpeed = 3-getRandomInt(6);
	this.receivedCoin = false;
	this.isCoin = false;
	this.img = meteoriteImg;
	this.draw = function(){
		ctx.translate(this.x, this.y);
		ctx.rotate(eulerToRadians(this.angle));
		ctx.drawImage(this.img, -this.w/2, -this.h/2, this.w, this.h);
		ctx.rotate(-eulerToRadians(this.angle));
		ctx.translate(-this.x, -this.y);
	};

	let target = {
		x: cnvs.width * 0.2 + getRandomInt(cnvs.width * 0.6) - this.x,
		y: spaceship.y + spaceship.h/2 - this.y
	};
	let magn = magnitude(target.x, target.y);
	this.direction.x = target.x / magn;
	this.direction.y = target.y / magn;
};

var background = {
	draw: () => {
		ctx.fillStyle = "#2C3052";
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);

		ctx.fillStyle = "#334769";
		ctx.fillRect(cnvs.width * 0.1, spaceship.y - 20, cnvs.width * 0.8, 40);

		ctx.beginPath();
		ctx.arc(cnvs.width * 0.1, spaceship.y, 20, 0, 2 * Math.PI);
		ctx.arc(cnvs.width * 0.9, spaceship.y, 20, 0, 2 * Math.PI);
		ctx.fill();
	}
}

var pauseMenuScoreTextAnimation = { 
	size: 70, 
	addition: true, 
	getNewSize:() =>{
		if(pauseMenuScoreTextAnimation.addition){
			pauseMenuScoreTextAnimation.size+=0.1;
		}
		else{
			pauseMenuScoreTextAnimation.size-=0.1;
		}

		if(pauseMenuScoreTextAnimation.addition && pauseMenuScoreTextAnimation.size >= 80){
			pauseMenuScoreTextAnimation.addition = false;
		}

		if(!pauseMenuScoreTextAnimation.addition && pauseMenuScoreTextAnimation.size <= 70){
			pauseMenuScoreTextAnimation.addition = true;
		}

		return pauseMenuScoreTextAnimation.size;
	}
};

var pauseMenu = {
	draw: () =>{
		ctx.fillStyle = "#2C3052";
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);
pause
		ctx.textAlign = "left";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("всего: " + total, 10, 50);

		ctx.font = pauseMenuScoreTextAnimation.getNewSize()+"px Roboto";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.fillText(score, cnvs.width/2, cnvs.height/2 - 50);

		ctx.font = "25px Roboto";
		if(isRecord){
			ctx.fillText("новый рекорд!", cnvs.width/2, cnvs.height/2 + 10);
		}
		else{
			ctx.fillText("рекорд: " + highScore, cnvs.width/2, cnvs.height/2 + 10);
		}
		ctx.font = "35px Roboto";
	}
}

var shopMenu = {
	draw: () => {
		ctx.fillStyle = "#2C3052";
		ctx.fillRect(0, 0, cnvs.width, cnvs.height);

		ctx.textAlign = "left";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("всего: " + total, 10, 50);
	}
}

//Call every frame
function update(){
	//buttons
	if(pause){
		if(firstPauseFrame){
			user.totalScore = total;
			user.highScore = highScore;

			if(isRecord){
				shareRecord();
			}

			firstPauseFrame = false;
			saveSaves();
		}

		if(!shop){
			shopButton.style.visibility = 'visible';
			replayButton.style.visibility = 'visible';

			backButton.style.visibility = 'hidden';
			shopPannel.style.visibility = 'hidden';
		}
		else{
			shopButton.style.visibility = 'hidden';
			replayButton.style.visibility = 'hidden';

			backButton.style.visibility = 'visible';
			shopPannel.style.visibility = 'visible';
		}
	}
	else{
		shopButton.style.visibility = 'hidden';
		replayButton.style.visibility = 'hidden';

		backButton.style.visibility = 'hidden';
	}

	//spaceship
	if(!pause && spaceship.directionRight){
		if(spaceship.x < cnvs.width * 0.9){
			spaceship.x+=spaceship.speed;
		}
		else{
			cahangeDirection();
		}
	}
	else{
		if(!pause && spaceship.x > cnvs.width * 0.1){
			spaceship.x-=spaceship.speed;
		}
		else{
			cahangeDirection();
		}
	}
	if(!pause){
		for(i = 0; i < meteorites.length; i++){
			if(meteorites[i].enable){
				meteorites[i].angle+=meteorites[i].rotationSpeed;
				meteorites[i].x += meteorites[i].direction.x * meteorites[i].speed;
				meteorites[i].y += meteorites[i].direction.y * meteorites[i].speed;
	
				if(spaceship.enable && magnitude(spaceship.x - meteorites[i].x, spaceship.y - meteorites[i].y) < spaceship.w*0.6){
					meteorites[i].enable = false;
					if(meteorites[i].isCoin){
						score+=10;
					}
					else{
						spaceship.enable = false;
						meteorites[i].enable = false;
						
						firstPauseFrame = true;
						pause = true;
						if(score > highScore){
							highScore = score;
							isRecord = true;
						}
						else{
							isRecord = false;
						}
	
						total += score;
					}
				}
	
				if(!pause && !meteorites[i].receivedCoin && !meteorites[i].isCoin && meteorites[i].y > spaceship.y + 50){
					meteorites[i].receivedCoin = true;
					score++;
				}
	
				if(!pause && meteorites[i].y > cnvs.height + 50){
					meteorites[i].enable = false;
				}
			}
		}
	}
	updateScreen();
}

function updateScreen(){
	background.draw();

	for(i = 0; i < meteorites.length; i++){
		if(meteorites[i].enable){
			meteorites[i].draw();
		}
	}

	if(spaceship.enable){
		spaceship.draw();
	}

	ctx.textAlign = "left";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText("очков: " + score, 10, 50);

	if(pause && !shop){
		pauseMenu.draw();
	}

	if(pause && shop){
		shopMenu.draw();
	}
}

function clickSpaceOrMouse(){
	if(!pause){
		cahangeDirection();
	}
}

function cahangeDirection(){
	spaceship.directionRight = spaceship.directionRight === true ? false : true;
}

function eulerToRadians(eulerAngle){
	return eulerAngle / 180 * Math.PI;
}

function magnitude(x, y){
	return Math.sqrt(x*x + y*y);
}

function getRandomInt(max) {
 	return Math.floor(Math.random() * Math.floor(max));
}

String.prototype.replaceAt = function(index, replacement) {
 	return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

String.prototype.getChar = function(index) {
 	return this.substr(index, index);
}

function makeMeteorite(){
	for(i = 0; i < meteorites.length; i++){
		if(!meteorites[i].enable){
			meteorites[i] = new Meteorite();
			meteorites[i].enable = true;

			if(getRandomInt(5) === 0){
				meteorites[i].isCoin = true;
				meteorites[i].img = coinImg;
			}
			break;
		}
	}
}

function replayClick(){
	score = 0;

	for(i = 0; i < meteorites.length; i++){
		meteorites[i].enable = false;
	}

	spaceship.enable = true;

	pause = false;
}

function shopClick(){
	shop = true;
}

function backClick(){
	shop = false;
}

function buyClick(indx, price){
	if(user.boughtSpaceships[indx] == 'b'){
		console.log(user.boughtSpaceships[indx]);
		for(let i = 0; i < user.boughtSpaceships.length; i++){
			if(user.boughtSpaceships[i] == 's'){
				console.log(i);
				console.log(user.boughtSpaceships[i]);
				user.boughtSpaceships = user.boughtSpaceships.replaceAt(i, 'b');
				console.log(user.boughtSpaceships[i]);
			}
		}
		user.boughtSpaceships = user.boughtSpaceships.replaceAt(indx, 's');

		eval("spaceship.img = spaceship" + indx + "Img;");
		updateShop();
		saveSaves();
		return;
	}
	if(user.boughtSpaceships[indx] == 'n'){
		console.log(user.boughtSpaceships[indx]);
		if(user.totalScore >= price){
			user.totalScore -= price;
			total -= price;

			for(let i = 0; i < user.boughtSpaceships.length; i++){
				if(user.boughtSpaceships[i] == 's'){
					console.log(i);
					user.boughtSpaceships = user.boughtSpaceships.replaceAt(i, 'b');
				}
			}
			user.boughtSpaceships = user.boughtSpaceships.replaceAt(indx, 's');
			eval("spaceship.img = spaceship" + indx + "Img;");
			updateShop();
			saveSaves();
		}
		return;
	}
}

function updateShop(){
	for(let i = 0; i < buyButtons.length; i++){
		if(user.boughtSpaceships[i] == 's'){
			buyButtons[i].textContent = "выбрано";
			buyButtons[i].style.backgroundColor = "green";
		}
		if(user.boughtSpaceships[i] == 'b'){
			buyButtons[i].textContent = "выбрать";
			buyButtons[i].style.backgroundColor = "#555";
		}
	}
}

//Flags
var firstPauseFrame = false, pause = true, shop = false, isRecord = false;
var highScore = user.highScore, score = 0, total = user.totalScore;


var meteorites = new Array();

function awake(){
	for(let i = 0; i < 10; i++){
		meteorites.push(new Meteorite());
	}



	let autoInterval = setInterval(update, 15);
	let autoInterval2 = setInterval(makeMeteorite, 700);
	document.addEventListener("mousedown", clickSpaceOrMouse);
	document.addEventListener("keydown", (event) => {if(event.code == 'Space') clickSpaceOrMouse()});
}

awake();
updateShop();