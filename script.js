// Bring in the data object from the data.js file
const data = window.data;

// State
const state = {
  keys:[],
  products: [],
  storage: [],
};

// References
const mainContainer = document.getElementById('main-container');
const header = document.getElementById('header');
const dialogBox = document.querySelector('.dialog-box');
const overlay = document.querySelector('.overlay');

// Class declaration
class Product {
  constructor(_name, _count, _totalUPPUT, _icon, _producers){
    this.name = _name;              // product name
    this.count = _count;            // product count
    this.totalUPPUT = _totalUPPUT;  // total units produced per unit time
    this.icon = _icon;
    this.producers = _producers;
  }

  updateDisplayedCount(){
    const productCounter = document.getElementById(`${this.name}-counter`);
    productCounter.innerText = this.count;
    this.renderProducers();
  }

  updateDisplayedTotalUPPUT(){
    const upputDiv = document.getElementById(`${this.name}-UPPUT`);
    upputDiv.innerText = this.totalUPPUT;
  }
  
  increaseThroughput(increase){
    this.totalUPPUT += increase;
    this.updateDisplayedTotalUPPUT();
  }

  clickProduct(){
    this.count += 1;
    this.updateDisplayedCount();
  }

  periodicProduction(){
    this.count += this.totalUPPUT;
    this.updateDisplayedCount();
  }

  deductCost(cost){
    this.count -= cost; 
  }

  setUnlocked(){
    this.producers.map(producer => {
      if(this.count >= producer.price / 2)
      producer.unlocked = true;
    });
  }
  
  formatName(string) {
    return string.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  makeProducerDiv() {
    return this.producers.map(producer => {
      if(producer.unlocked){
        const containerDiv = document.createElement("div");
        containerDiv.className = "producer";
        if(producer.qty > 0){
          containerDiv.classList.add('bought');
          containerDiv.style.backgroundColor = `rgba(80, 220, 150, ${producer.qty / 5})`
        }
    
        const producerHtml = `
        <div class="producer-column">
          <div class="producer-name">${this.formatName(producer.id)}</div>
        </div>
        <div class="producer-column">
          <div>Quantity: ${producer.qty}</div>
          <div>Unit/month: ${producer.upput}</div>
          <div>Cost: ${producer.price} Unit</div>
        </div>
        `;
        containerDiv.innerHTML = producerHtml;
        const buyBtn = document.createElement('button');
        buyBtn.textContent = 'Buy';
        buyBtn.className = `${this.name}_button`;
        buyBtn.id = `buy_${producer.id}`;
        buyBtn.addEventListener('click', (event) => this.buyBtnClick(event));
        containerDiv.append(buyBtn);       
        return containerDiv;
      }
      return '';
    });
  }

  // Handling buy buttons click events 
  buyBtnClick(event){
    const producerId = event.target.id.slice(4);
    const selectedProducer = this.producers.find(producer => producer.id === producerId);
    if(selectedProducer.price <= this.count){  
      this.deductCost(selectedProducer.price);
      selectedProducer.qty += 1;
      selectedProducer.price = Math.floor(selectedProducer.price * 1.25);
      this.increaseThroughput(selectedProducer.upput);

      this.renderProducers();
    }
    else{
      window.alert("Not enough produced units!");      
    } 
  }

  renderProducers(){
    const producersCard = document.getElementById(`${this.name}-producers`);
    this.setUnlocked();      
    const producersDivs = this.makeProducerDiv();
    producersCard.replaceChildren(...producersDivs);
  } 

  setHtml(){
    const productContainer = document.createElement('div');
    productContainer.className = 'product-container';

    const iconEl = document.createElement('div')
    iconEl.className = 'icon'
    iconEl.id = `${this.name}-icon`;
    iconEl.textContent = this.icon;
    iconEl.addEventListener('click', () => {
      this.clickProduct();
    });

    const indicators = document.createElement('div')
    indicators.innerHTML =  `
    <div class="indicators">
        <div class="counter-container">${this.formatName(this.name)}: <span id="${this.name}-counter">0</span></div>
        <div class="UPPUT-container"><span id="${this.name}-UPPUT">${this.totalUPPUT}</span> ${this.name}/month</div>
    </div> 
    `;

    const top = document.createElement('div')
    top.className = 'top'
    top.append(iconEl, indicators);

    const producersTitle = document.createElement('div')
    producersTitle.className = 'producers-title'
    producersTitle.textContent = `${this.formatName(this.name)} Producers`

    const bottom = document.createElement('div')
    bottom.className = 'bottom'
    bottom.id = `${this.name}-producers` 

    productContainer.append(top, producersTitle, bottom);

    return productContainer;
  }
}

//
function creatHtml(){
  const productContainers = state.products.map(product => product.setHtml());
  mainContainer.replaceChildren(... productContainers);
}

//
function saveData(){
  state.products.forEach(product => localStorage.setItem(`${product.name}`, JSON.stringify(product)));
}

function  showDialogBox(){
  dialogBox.classList.add('active');
  overlay.classList.add('active');
}

function hideDialogBox(){
  dialogBox.classList.remove('active');  
  overlay.classList.remove('active');
}

//
function creatDialogBox(message, actionEl){
  // const message = document.createElement('output');
  const messageEl = document.createElement('output');
  messageEl.textContent = message;

  const actionBar = document.createElement('div');
  actionBar.className = 'action-bar';
  actionBar.append(actionEl);

  if(!hasLogOut){
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.id = 'cancel-button';
    cancelButton.addEventListener('click', () => {
      isPaused = false;
      hideDialogBox();
    });
    actionBar.append(cancelButton);
  }
  dialogBox.replaceChildren(messageEl, actionBar);
  showDialogBox();
}

//
const saveBtn = document.createElement('button');
header.append(saveBtn);
saveBtn.textContent = 'Save';
saveBtn.addEventListener('click', () => {
  saveData();
  
  const okBtn = document.createElement('button');
  okBtn.textContent = 'OK';
  okBtn.addEventListener('click', hideDialogBox);

  const message = 'Data has been saved successfully.';
  creatDialogBox(message, okBtn);
});
//
////////////////////////////////
function hasGotData(){
  for(let key of state.keys){
    const prdObj = JSON.parse(localStorage.getItem(key));
      if(prdObj === null){
        return false;
      }
      else{
        console.log("this one done perfectly...");
        state.storage.push(new Product(prdObj.name, prdObj.count, prdObj.totalUPPUT,prdObj.icon, prdObj.producers));
      }
  }
  return true;
}
//
const restoreBtn = document.createElement('button');
restoreBtn.textContent = 'Restore';
// restoreBtn.id = 'restore-button';
header.append(restoreBtn);
restoreBtn.addEventListener('click', () => {
  const restoreConfirmBtn = document.createElement('button');
  restoreConfirmBtn.textContent = 'Restore';
  // restoreConfirmBtn.id = ``;

  restoreConfirmBtn.addEventListener('click', () => {
    let rsltMsg = '';
    state.storage.length = 0;
    
    if(hasGotData()){
      state.products.length = 0;
      state.products.push(...state.storage);
      rsltMsg = 'Data has been uploaded successfully!'
    }
    else{
      rsltMsg = 'Oops, something went wrong with restoring data!'
    }
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.addEventListener('click', hideDialogBox);
    creatDialogBox(rsltMsg, okBtn);

    creatHtml();
    state.products.forEach(product => {
      product.updateDisplayedTotalUPPUT();
      product.updateDisplayedCount();
    });   
  });

  const clarifMsg = 'Proceeding with this action may result in the loss of your current data. Are you sure you want to to restore the latest saved data?';
  creatDialogBox(clarifMsg, restoreConfirmBtn);
});

const pausePlayBtn = document.createElement('button');
pausePlayBtn.textContent = 'Pause';
pausePlayBtn.classList.add('play');

header.append(pausePlayBtn);

let isPaused = false;
pausePlayBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pausePlayBtn.classList.toggle('play', !isPaused);  // toggle(token, force)
  pausePlayBtn.textContent = isPaused ? 'Play' : 'Pause';
});

//
const stopBtn = document.createElement('button');
stopBtn.textContent = 'Stop';
header.append(stopBtn);
stopBtn.addEventListener('click', () => {
  isPaused = true;
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save changes';

  saveBtn.addEventListener('click', () => {
    saveData();
    const message = 'Data has been saved, and you have successfully logged out of the application.'
    logOut(message);
  });

  const stopConfirmButton = document.createElement('button');
  stopConfirmButton.textContent = 'Leave without Saving';  
  stopConfirmButton.addEventListener('click', () => {
    const message = 'You have successfully logged out of the application.'
    logOut(message); 
  });

  const stopConfirmDiv = document.createElement('div');
  stopConfirmDiv.className = 'stopConfirmDiv'
  stopConfirmDiv.append(saveBtn, stopConfirmButton);
  
  const message = 'You are about to leave this page without saving. All changes will be lost. Do you want to leave without saving?';
  creatDialogBox(message, stopConfirmDiv);
  
});

//
let hasLogOut = false;
function logOut(message){
  hasLogOut = true;
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start again';
  startBtn.addEventListener('click', () => location.reload()); //refresh Page
  creatDialogBox(message, startBtn);
  overlay.classList.add('logOut');
}

//
// Set up the initial state
function init(){
  // Initilize state object 
  data.forEach(el => {
    state.keys.push(el.name);
    state.products.push(Object.setPrototypeOf(el, Product.prototype));
  });
  // OR to preserve data as it is:
  // data.forEach(el => {
  //   state.keys.push(el.name);
  //   state.products.push(new Product(el.name, el.count, el.totalUPPUT,el.icon, el.producers) );
  // });
  creatHtml();
}

init();

// Periodic step
function tick() {
    state.products.forEach(product => product.periodicProduction());
}

// Rpeat the tick function every 1000ms, or 1s
setInterval(() =>{
  if(!isPaused) {
    tick();  
  }
}, 1000);
