// Bring in the data object from the data.js file
const data = window.data;

// State
const state = {
  products: [],
};

// References
const mainContainer = document.getElementById('main-container');

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
    this.renderProducers();
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
        if(producer.qty > 0)
          containerDiv.classList.add('bought');
        const producerHtml = `
        <div class="producer-column">
          <div class="producer-name">${this.formatName(producer.id)}</div>
        </div>
        <div class="producer-column">
          <div>Quantity: ${producer.qty}</div>
          <div>Unit/second: ${producer.upput}</div>
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
      this.renderProducers();
    });

    const indicators = document.createElement('div')
    indicators.innerHTML =  `
    <div class="indicators">
        <div class="counter-container">${this.formatName(this.name)}: <span id="${this.name}-counter">0</span></div>
        <div class="UPPUT-container"><span id="${this.name}-UPPUT">0</span> ${this.name}/month</div>
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

// Set up the initial state
function init(){
  // Create Product instances
  data.forEach(el => state.products.push(Object.setPrototypeOf(el, Product.prototype)));
  // OR to preserve data as it is:
  // data.forEach(el => state.products.push(new Product(el.name, el.count, el.totalUPPUT,el.icon, el.producers) ));

  // set HTML
  const productContainers = state.products.map(product => product.setHtml());
  mainContainer.replaceChildren(... productContainers);
}

init();

// Periodic step
function tick() {
    state.products.forEach(product => product.periodicProduction());
}

// Rpeat the tick function every 1000ms, or 1s
setInterval(() => tick(), 1000);
