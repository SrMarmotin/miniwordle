import { words } from './word.js';

const WORD_LENGTH = 5;
const FLIP_TIME   = 500;

const targetWords = words;
const dictionary  = words;
const targetWord  = targetWords[Math.floor(Math.random() * targetWords.length)];

const tileGrid       = document.querySelector("[data-grid]");
const alertContainer = document.querySelector("[data-alerts]");
const keyboard       = document.querySelector("[data-keyboard]");

startInteraction();

function startInteraction(){
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
}

function stopInteraction(){
    document.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKeyDown);
}

function handleClick(e){
    if(e.target.matches("[data-key]")){
        pressKey(e.target.dataset.key);
        return false;
    }
    
    if(e.target.matches("[data-enter]")){
        submitWord();
        return false;
    }
    
    if(e.target.matches("[data-delete]")){
        deleteKey();
        return false;
    }
}

function handleKeyDown(e){
    if(e.key.match(/^[a-zA-Z]$/)){
        pressKey(e.key);
        return false;
    }
    
    if(e.key == 'Backspace' || e.key == 'Delete'){
        deleteKey();
        return false;
    }
    
    if(e.key == 'Enter'){
        submitWord();
        return false;
    }
}

function pressKey(key){
    const activeTiles = getActiveTiles();
    
    if(activeTiles.length >= WORD_LENGTH) 
        return false;
    
    const nextTile = tileGrid.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = 'active';
}

function deleteKey(){
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length - 1];
    
    if(lastTile == null)
        return false;
    
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;
}

function submitWord(){
    const activeTiles = [...getActiveTiles()];

    if(activeTiles.length != WORD_LENGTH){
        shakeTiles(activeTiles);
        showAlert('No hay suficientes letras');
        return false;
    }
    
    const guess = joinWord(activeTiles);
    if(checkGuess(activeTiles, guess)){
        stopInteraction();
        activeTiles.forEach((...params) => flipTile(...params, guess));
    }
}

function joinWord(tiles){
    const guess = tiles.reduce((word, tile) => {
        return word + tile.dataset.letter;
    }, "");
    
    return guess;
}

function checkGuess(tiles, word){
    if(!dictionary.includes(word)){
        shakeTiles(tiles);
        showAlert('La palabra no está en el diccionario');
        return false;
    } 
    return true;
}

function flipTile(tile, index, array, guess){
    const letter = tile.dataset.letter;
    const key    = keyboard.querySelector(`[data-key="${letter.toUpperCase()}"]`);
    
    setTimeout(() => {
        tile.classList.add('flip');
    }, (index * FLIP_TIME) / 2);
    
    tile.addEventListener('transitionend', () => {
        tile.classList.remove('flip');
        
        if(targetWord[index] === letter){
            tile.dataset.state = 'correct';
            key.classList.add('correct');
        }else if(targetWord.includes(letter)){
            tile.dataset.state = 'wrong-location';
            key.classList.add('wrong-location');            
        }else{
            tile.dataset.state = 'wrong';
            key.classList.add('wrong');    
        }
        
        if(index === array.length - 1){
            startInteraction(); 
            checkGame(guess, array);
        }
    }, { once: true });
}

function getActiveTiles(){
    return tileGrid.querySelectorAll('[data-state="active"]');
}

function shakeTiles(tiles){
    tiles.forEach(tile => {
        tile.classList.add('shake');
        tile.addEventListener('animationend', () => {
            tile.classList.remove('shake');
        }, { once: true });
    });
}

function jumpTiles(tiles){
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('jump');
            tile.addEventListener('animationend', () => {
                tile.classList.remove('jump');
            }, { once: true });
        }, (index * FLIP_TIME) / WORD_LENGTH );
    });
}

function showAlert(message, duration = 600){
    const alert = document.createElement('div');
    alert.classList.add('alert');
    alert.textContent = message;
    alertContainer.append(alert);
    
    setTimeout(() => {
        alert.classList.add('hide');
        alert.addEventListener('transitionend', () => {
            alert.remove();
        })
    }, duration);
}

function checkGame(guess, tiles){
    if(guess === targetWord){
        jumpTiles(tiles);
        showAlert('Has ganado!', 2000);
        stopInteraction();
        return false;
    }
    
    remainingTiles();
}

function remainingTiles(){
    const remains = tileGrid.querySelectorAll(':not([data-letter])');
    if(remains.length == 0){
        showAlert(`Has perdido la palabra era: ${targetWord.toUpperCase()}`, 2000);
        stopInteraction();
    }
}