// Bring in the data object from the data.js file
const data = window.data;

// References
const mainContainer = document.getElementById('main-container');

// Classes declaration
class Product {
  constructor(_name, _product){
    this.name = _name;
    this.count = _product.count;            // product count
    this.totalUPPUT = _product.totalUPPUT;  // total units produced per unit time
    this.icon = _product.icon;
  }
  getCount() { return this.count; }

  updateDisplayedCount(){
    const productCounter = document.getElementById(`${this.name}-counter`);
    productCounter.innerText = this.count;
  }

  updateDisplayedTotalUPPUT(){
    const upputDiv = document.getElementById(`${this.name}-UPPUT`);
    upputDiv.innerText = this.totalUPPUT;
  }
  clickProduct(){
    this.count += 1;
    this.updateDisplayedCount();
  }

  deductCost(cost){
    this.count -= cost; 
  }
  
  increaseThroughput(increase){
    this.totalUPPUT += increase;
    this.updateDisplayedTotalUPPUT();
  }
}

class Producer { 
  constructor(_name, _producer){
    this.name = _name;
    this.id = _producer.id;
    this.price = _producer.price;
    this.unlocked = _producer.unlocked;
    this.upput = _producer.upput;
    this.qty = _producer.qty;
  }

  setUnlocked(count){
    if(count >= this.price / 2){
      this.unlocked = true;
    }
  }

  makeDisplayNameFromId() {
    return this.id.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  makeProducerDiv() {
    if(this.unlocked){
      const containerDiv = document.createElement("div");
      containerDiv.className = "producer";
      if(this.qty > 0){
        containerDiv.classList.add('bought');
      }
      const producerHtml = `
        <div class="producer-column">
          <div class="producer-name">${this.makeDisplayNameFromId()}</div>
        </div>
        <div class="producer-column">
          <div>Quantity: ${this.qty}</div>
          <div>Unit/second: ${this.upput}</div>
          <div>Cost: ${this.price} Unit</div>
        </div>
      `;
      containerDiv.innerHTML = producerHtml;
      const buyBtn = document.createElement('button');
      buyBtn.textContent = 'Buy';
      buyBtn.className = `${this.name}_button`;
      buyBtn.id = `buy_${this.id}`;
      buyBtn.addEventListener('click', (event) => buyBtnClick(event,this.name));
      containerDiv.append(buyBtn);       

      return containerDiv;
    }
    return '';    
  }
  attemptToBuyProducer(product){
    if(this.price <= product.getCount()){  
        product.deductCost(this.price);
        this.qty += 1;
        this.price = Math.floor(this.price * 1.25);
        product.increaseThroughput(this.upput);
    }
    else{
      window.alert("Not enough produced units!");      
    }  
  }
}

//// Handling buy button events 
function buyBtnClick(event, name){
    const producerId = event.target.id.slice(4);
    for(let index in products){
        
        if(products[index].name === name){
            const selectedProducer = producers[index].find(producer => producer.id === producerId);
            selectedProducer.attemptToBuyProducer(products[index]);
        }
    }
    render();
  }

///////
function render(){
  products.forEach((product, index) => {
    const producersCard = document.getElementById(`${product.name}-producers`);
    const producersDivs = producers[index].map(producer => {
        producer.setUnlocked(product.getCount());
        return producer.makeProducerDiv();
    });
    producersCard.replaceChildren(...producersDivs);
  });
}

//
function capitalize(word){
  // return toUpperCase(word[0]) + word.slice(1);
  return word.charAt(0).toUpperCase() + word.slice(1);
}

////
function setHtml(){
    const productContainers = products.map(product => {
        const productContainer = document.createElement('div');
        productContainer.className = 'product-container';

    const productHtml = `
      <div class="top">
          <div class="counter-container">${capitalize(product.name)}: <span id="${product.name}-counter">0</span></div>
          <div class="UPPUT-container"><span id="${product.name}-UPPUT">0</span> ${product.name}/month</div>
          <div class="icon" id="${product.name}-iicon">${product.icon}</div>
      </div>
      <div class="producers-title">${capitalize(product.name)} Producers</div>
      <div class="bottom" id="${product.name}-producers"></div>
      `;
    productContainer.innerHTML = productHtml;
    return productContainer;
    });
    mainContainer.replaceChildren(... productContainers);
}

/// Create Product and Producer instances
const products = [];
const producers = [];
for(let key in data){
    products.push(new Product(key, data[key]));
    const prtProducers = data[key].producers.map(producer => {
        return new Producer(key, producer);
    });
    producers.push(prtProducers);
}

// init 
setHtml();

// Handling icon click events 
products.forEach(product => {
    const iconEl = document.getElementById(`${product.name}-iicon`);
    iconEl.addEventListener('click', () => {
        product.clickProduct();
        render();
    });
});

//// cycle
function tick() {
    products.forEach(product => {
        product.count += product.totalUPPUT;
        product.updateDisplayedCount();
    });
  render();
}

// Rpeat the tick function every 2000ms, or 2s
setInterval(() => tick(), 2000);
