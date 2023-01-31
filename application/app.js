const app = () => {
  const grid = document.querySelector('.grid_player');
  let squares = Array.from(document.querySelectorAll('.grid_player div'));
  const scoreDisplay = document.querySelector('#score_player');
  const startButton = document.querySelector('#start-button_player');
  const width = 10;
  let timerId;
  let time = 1000;
  let score = 0;
  let fastenerTimer;
  let isFirstStart = true;
  let isPlayerGameOver = false;

  const gridRobot = document.querySelector('.grid_robot');
  let squaresRobot = Array.from(document.querySelectorAll('.grid_robot div'));
  const scoreDisplayRobot = document.querySelector('#score_robot');
  const startButtonRobot = document.querySelector('#start-button_player');
  let timerIdRobot;
  let scoreRobot = 0;
  let isRobotGameOver = false;

  const colors = [
    '#ffd670',
    '#ff9770',
    '#ff70a6',
    '#af90a3',
    '#70d6ff',
    '#9470ff',
    '#ff4f4f',
  ]

  const lShape = [
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2],
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
  ]
  
  const inversLShape = [
    [0, 1, width+1, width*2+1],
    [2, width, width+1, width+2],
    [1, width+1, width*2+1, width*2+2],
    [0, 1, 2, width]
  ]
  
  const zShape = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
  ]
  
  const inversZShape = [
    [1, width, width+1, width*2],
    [0, 1, width+1, width+2],
    [1, width, width+1, width*2],
    [0, 1, width+1, width+2]
  ]
  
  const tShape = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
  ]
  
  const oShape = [
    [0,1,width, width+1],
    [0,1,width, width+1],
    [0,1,width, width+1],
    [0,1,width, width+1]
  ];
  
  const iShape = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
  ];
  
  const shapes = [lShape, inversLShape, zShape, inversZShape, tShape, oShape, iShape];

  let currentPosition = 4;
  let currentRotation = 0;

  //randomly select a shape
  let random = Math.floor(Math.random() * shapes.length);
  let current = shapes[random][currentRotation];

  //draw the shape
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('shape');
      squares[currentPosition + index].style.backgroundColor = colors[random];
    })
  }

  //erase the shape
  function erase() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('shape');
      squares[currentPosition + index].style.backgroundColor = '';
    })
  }
  
  function control(e) {
    if (!isPlayerGameOver) {
      if(e.keyCode === 37) {
        moveLeft();
      } else if (e.keyCode === 38) {
        rotate()  
      } else if (e.keyCode === 39) {
        moveRight()
      } else if(e.keyCode === 40) {
        moveDown()
      }
    }
  }

  function moveDown() {
    erase();
    currentPosition += width;
    draw();
    freeze();
  }

  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'));
      
      //start a new shape
      random = Math.floor(Math.random() * shapes.length);
      current = shapes[random][currentRotation];
      currentPosition = 4;
      addScore();
      gameOver();
      if (!isRobotGameOver) {
        draw();
      }
    }
  }

  function moveLeft() {
    erase();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

    if (!isAtLeftEdge) {
      currentPosition --;
    }

    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition ++;
    }
    freeze();
    draw();
  }

  function moveRight() {
    erase();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

    if (!isAtRightEdge) {
      currentPosition ++;
    }

    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition --;
    }

    freeze();
    draw();
  }

  function rotate() {
    erase();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

    if (isAtLeftEdge) {
      currentPosition++;
    }

    if (isAtRightEdge) {
      currentPosition-=2;
    }

    currentRotation ++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }

    next = shapes[random][currentRotation];

    if (next.some(index => squares[currentPosition + index].classList.contains('taken'))){
      current = current;
    } else {
      current = next;
    }
    draw();
  }

  startButton.addEventListener('click', () =>{
    if (timerId) {
      startButton.innerHTML = 'Start';
      clearInterval(timerId);
      clearInterval(timerIdRobot);
      timerId = null;
      document.removeEventListener('keydown', control);
      clearInterval(fastenerTimer);
      clearInterval(fastenerTimerRobot);
      timerIdRobot = null;
      document.removeEventListener('keydown', moveDownRobot);
    } else {
      startButton.innerHTML = 'Stop';
      if (isFirstStart) {
        score = 0;
        scoreDisplay.innerHTML = score;
        isFirstStart = false;
        backToBasic(squares);
        backToBasic(squaresRobot);
        controlRobot();
      }
      draw();
      fastenerTimer = setInterval(() => {
        if (time > 200) {
          time -= 100;
        }
        clearInterval(timerId);
        timerId = setInterval(moveDown, time);
      }, 20000);
      timerId = setInterval(moveDown, time); 
      document.addEventListener('keydown', control);   
      drawRobot();
      timerIdRobot = setInterval(moveDownRobot, 250); 
    }
    isRobotGameOver = false;
    isPlayerGameOver = false;
  })

  function addScore() {
    eraseRobot()
    for (let i = 0; i < 199; i+=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
      
      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        let robotFirstRow = squaresRobot.splice(0, width);
        const robotLastRow = squaresRobot.splice(190, width);

        row.forEach(index => {
          robotFirstRow[index - i].classList.add('taken');
          robotFirstRow[index - i].classList.add('shape');
          robotFirstRow[index - i].style.backgroundColor = squares[index].style.backgroundColor;
          squares[index].classList.remove('taken');
          squares[index].classList.remove('shape');
          squares[index].style.backgroundColor = '';
        })

        let rand = Math.floor(Math.random() * 10);
        robotFirstRow[rand].classList.remove('taken');
        robotFirstRow[rand].classList.remove('shape');
        robotFirstRow[rand].style.backgroundColor = '';

        erase();
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squaresRobot = squaresRobot.concat(robotFirstRow);
        squaresRobot = squaresRobot.concat(robotLastRow);
        squares.forEach(cell => grid.appendChild(cell));
        squaresRobot.forEach(cell => gridRobot.appendChild(cell));
      }
    } 
    drawRobot()
    freezeRobot();
  }

  function gameOver() {
    erase();
    draw();
    if(current.some(index => squares[currentPosition + index].classList.contains('taken')) || isRobotGameOver || getMaxHeight(squares) >= 17) {
      clearInterval(timerId);
      clearInterval(fastenerTimer);
      fastenerTimer = null;
      time = 1000;
      timerId = null;
      document.removeEventListener('keydown', control);
      startButton.innerHTML = 'Start';
      isFirstStart = true;
      isPlayerGameOver = true;
      erase();
    }
  }

//robot part

let currentPositionRobot = 4;
let currentRotationRobot = 0;
let goRightTimer;

//randomRobotly select a shape
let randomRobot = Math.floor(Math.random() * shapes.length);
let currentRobot = shapes[randomRobot][currentRotationRobot];

//drawRobot the shape
function drawRobot() {
  currentRobot.forEach(index => {
    squaresRobot[currentPositionRobot + index].classList.add('shape');
    squaresRobot[currentPositionRobot + index].style.backgroundColor = colors[randomRobot];
  })
}

//eraseRobot the shape
function eraseRobot() {
  currentRobot.forEach(index => {
    squaresRobot[currentPositionRobot + index].classList.remove('shape');
    squaresRobot[currentPositionRobot + index].style.backgroundColor = '';
  })
}


function controlRobot() {
  eraseRobot();
  parameters = chooseTheBest();
  console.log(parameters);
  getBestRotation(parameters[0]);
  copy_position = currentPositionRobot;
  currentPositionRobot = moveToLeftRobot(currentRobot, currentPositionRobot);
  while (copy_position !== currentPositionRobot) {
    copy_position = currentPositionRobot;
    currentPositionRobot = moveToLeftRobot(currentRobot, currentPositionRobot);
  }
  drawRobot();

  let ind = 0;
  goRightTimer = setInterval(() => {
    if (ind < parameters[1]) {
      moveRightRobot();
      ind++;
    }
  }, 30);

}

function getBestRotation(rotation) {
  while(currentRotationRobot != rotation) {
    rotateRobot();
  }
}

function moveDownRobot() {
  eraseRobot();
  currentPositionRobot += width;
  drawRobot();
  freezeRobot();
}

function freezeRobot() {
  if (currentRobot.some(index => squaresRobot[currentPositionRobot + index + width].classList.contains('taken'))) {
    currentRobot.forEach(index => squaresRobot[currentPositionRobot + index].classList.add('taken'));
    //start a new shape
    randomRobot = Math.floor(Math.random() * shapes.length);
    currentRotationRobot = 0;
    currentRobot = shapes[randomRobot][currentRotationRobot];
    currentPositionRobot = 4;
    addscoreRobot();
    drawRobot();
    gameOverRobot();
    clearInterval(goRightTimer);
    controlRobot();
  }
}

function moveRightRobot() {
  eraseRobot();
  const isAtRightEdge = currentRobot.some(index => (currentPositionRobot + index) % width === width - 1);

  if (!isAtRightEdge) {
    currentPositionRobot ++;
  }

  if (currentRobot.some(index => squaresRobot[currentPositionRobot + index].classList.contains('taken'))){
    currentPositionRobot --;
  }
  freezeRobot();
  drawRobot();
}

function rotateRobot() {
  const isAtLeftEdge = currentRobot.some(index => (currentPositionRobot + index) % width === 0);
  const isAtRightEdge = currentRobot.some(index => (currentPositionRobot + index) % width === width - 1);

  if (isAtLeftEdge) {
    currentPositionRobot++;
  }

  if (isAtRightEdge) {
    currentPositionRobot-=2;
  }

  currentRotationRobot ++;
  if (currentRotationRobot === currentRobot.length) {
    currentRotationRobot = 0;
  }
  currentRobot = shapes[randomRobot][currentRotationRobot];
}

function addscoreRobot() {
  erase()
  for (let i = 0; i < 199; i+=width) {
    const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
    
    if (row.every(index => squaresRobot[index].classList.contains('taken'))) {
      scoreRobot += 10;
      scoreDisplayRobot.innerHTML = scoreRobot;
      let playerFirstRow = squares.splice(0, width);
      const playerLastRow = squares.splice(190, width);

      row.forEach(index => {
        playerFirstRow[index - i].classList.add('taken');
        playerFirstRow[index - i].classList.add('shape');
        playerFirstRow[index - i].style.backgroundColor = squaresRobot[index].style.backgroundColor;
        squaresRobot[index].classList.remove('taken');
        squaresRobot[index].classList.remove('shape');
        squaresRobot[index].style.backgroundColor = '';
      })

      let rand = Math.floor(Math.random() * 10);
      playerFirstRow[rand].classList.remove('taken');
      playerFirstRow[rand].classList.remove('shape');
      playerFirstRow[rand].style.backgroundColor = '';

      eraseRobot();
      const squaresRemoved = squaresRobot.splice(i, width);
      squaresRobot = squaresRemoved.concat(squaresRobot);
      squares = squares.concat(playerFirstRow);
      squares = squares.concat(playerLastRow);
      squaresRobot.forEach(cell => gridRobot.appendChild(cell));
      squares.forEach(cell => grid.appendChild(cell));
    }
  } 
  draw();
  freeze();
}

function gameOverRobot() {
  eraseRobot()
  drawRobot()
  if(currentRobot.some(index => squaresRobot[currentPositionRobot + index].classList.contains('taken')) || isPlayerGameOver || getMaxHeight(squaresRobot) >= 17) {
    clearInterval(timerIdRobot);
    time = 1000;
    timerIdRobot = null;
    isFirstStart = true;
    document.removeEventListener('keydown', controlRobot);
    startButtonRobot.innerHTML = 'Start';
    scoreDisplayRobot.innerHTML = scoreRobot;
    isRobotGameOver = true;
    eraseRobot();
  }
}

function backToBasic(whichSquares) {
  for (let i = 0; i < 200; i++)
  {
    whichSquares[i].classList.remove('shape');
    whichSquares[i].classList.remove('taken');
    whichSquares[i].style.backgroundColor = '';
  }
  
  for (let i = 200; i < 210; i++)
  {
    whichSquares[i].classList.add('taken');
  }
}

// botfunctions
function calculateAggregateHeight() {
  height = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 200; i++) {
    if ((squaresRobot[i].classList.contains('shape') || squaresRobot[i].classList.contains('taken')) && height[i%10] === 0) {
      i%10 === 0 ? height[i%10] = Math.floor((200 - i) /10) : height[i%10] = Math.floor((200 - i) /10) + 1;
    }
  }

  aggHeight = 0;
  for (let i = 0; i < 10; i++)
  {
    aggHeight += height[i];
  }

  return aggHeight;
}

//Ha nem mukodik ezt kell ellenorizzem
function completeLines() {
  let nr = 0;

  for (let i = 0; i < 199; i+=width) {
    const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
    if (row.every(index => squaresRobot[index].classList.contains('taken') || squaresRobot[index].classList.contains('shape'))) {
      nr++;
    }
  }

  return nr;
}

function calculateNumberOfHoles() {
  nr = 0;
  for (let i = 10; i < 200; i++) {
    if (!squaresRobot[i].classList.contains('shape') && !squaresRobot[i].classList.contains('taken') && (squaresRobot[i-width].classList.contains('shape') || squaresRobot[i-width].classList.contains('taken'))) {
      nr++;
    }
  }

  return nr;
}

function calculateBumpiness() {
  height = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 200; i++) {
    if ((squaresRobot[i].classList.contains('shape') || squaresRobot[i].classList.contains('taken')) && height[i%10] === 0) {
      
      i%10 === 0 ? height[i%10] = Math.floor((200 - i) /10) : height[i%10] = Math.floor((200 - i) /10) + 1;
    }
  }

  bumpiness = 0;

  for (let i = 0; i < width - 1; i++) {
    bumpiness +=  Math.abs(height[i] - height[i + 1]);
  }

  return  bumpiness;
}

function chooseTheBest() {
  let copy_current;
  let position;
  let fitness;
  let bestScore = null;
  let rotationNumber = 0;
  let colNumber = 0;

  for (let i = 0; i < 4; i++) {
    position = currentPosition;
    copy_current = shapes[randomRobot][i];
    copy_position = position;
    position = moveToLeftRobot(copy_current, position);
    while (copy_position !== position) {
      copy_position = position;
      position = moveToLeftRobot(copy_current, position);
    }

    let cNr = 0;
    copy_position = position - 1;
    while(copy_position !== position) {
      copy_position = position;
      position = moveToBottomRobot(copy_current, position);
      copy_current.forEach(index => {
        squaresRobot[position + index].classList.add('shape');
      })
      let height = calculateAggregateHeight();
      let cmpltLines = completeLines();
      let nrOfHoles = calculateNumberOfHoles();
      let bumpiness = calculateBumpiness();
      fitness = -0.510066 * height + 0.760666 * cmpltLines - 0.35663 * nrOfHoles - 0.184483 * bumpiness;
      if (fitness > bestScore || bestScore === null) {
        bestScore = fitness;
        rotationNumber = i;
        colNumber = cNr;
      }
      copy_current.forEach(index => {
        squaresRobot[position + index].classList.remove('shape');
      })
      position = copy_position;
      position = moveToRightRobot(copy_current, position);
      cNr++;
    }
  }

  return [rotationNumber, colNumber];
}

function moveToLeftRobot(shape, position) {
  const isAtLeftEdge = shape.some(index => (position + index) % width === 0);

  if (!isAtLeftEdge) {
    position --;
  }

  if (shape.some(index => squaresRobot[position + index].classList.contains('taken'))){
    position ++;
  }

  return position;
}

function moveToRightRobot(shape, position) {
  const isAtRightEdge = shape.some(index => (position + index) % width === width - 1);

  if (!isAtRightEdge) {
    position ++;
  }

  if (shape.some(index => squaresRobot[position + index].classList.contains('taken'))){
    position --;

  }

  return position;
}

function moveToBottomRobot(shape, position) {
  while(!onTheBottom(shape, position)) {
    position += width;
  }

  return position;
}

function onTheBottom(shape, position) {
  return shape.some(index => squaresRobot[position + index + width].classList.contains('taken'))
}


function getMaxHeight(whichSquares) {
  height = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 200; i++) {
    if (whichSquares[i].classList.contains('taken') && height[i%10] === 0) {
      i%10 === 0 ? height[i%10] = Math.floor((200 - i) /10) : height[i%10] = Math.floor((200 - i) /10) + 1;
    }
  }
  maxi = height[0];
  for (let i = 1; i< 10; i++) {
    if (height[i] > maxi) {
      maxi = height[i];
    }
  }

  return maxi;
}

};
