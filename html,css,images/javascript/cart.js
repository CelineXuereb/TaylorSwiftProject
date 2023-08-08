let openShopping = document.querySelector('.shopping');
let closeShopping =document.querySelector('.closeShopping')
let list =document.querySelector('.list');
let listcard =document.querySelector('.listCard');
let total =document.querySelector('.total');
let quantity =document.querySelector('.quantity');

openShopping.addEventListener('click') ,()=>{
    body.classlist.add('active');
})

openShopping.addEventListener('click') ,()=>{
    body.classlist.add('remove');
})

let products = [
    {
        id:1,
        name: 'PRODUCT NAME 1',
        image: '1.PNG',
        price: 120000
    },
    {
        id:2,
        name: 'PRODUCT NAME 1',
        image: '2.PNG',
        price: 120000
    },
    {
        id:3,
        name: 'PRODUCT NAME 1',
        image: '3.PNG',
        price: 120000
    },
    {
        id:4,
        name: 'PRODUCT NAME 1',
        image: '4.PNG',
        price: 120000
    },
    {
        id:5,
        name: 'PRODUCT NAME 1',
        image: '5.PNG',
        price: 120000
    },
    {
        id:6,
        name: 'PRODUCT NAME 1',
        image: '6.PNG',
        price: 120000
    },
    {
        id:7,
        name: 'PRODUCT NAME 1',
        image: '7.PNG',
        price: 120000
    },
    {
        id:8,
        name: 'PRODUCT NAME 1',
        image: '8.PNG',
        price: 120000
    },
    {
        id:9,
        name: 'PRODUCT NAME 1',
        image: '9.PNG',
        price: 120000
    },
    {
        id:10,
        name: 'PRODUCT NAME 1',
        image: '10.PNG',
        price: 120000
    },
];

let listCards = [];
function initApp(){
    products.forEach((value,key)=>{
        let newDiv =document.createElement('div');
        newDiv.innerHTML ='
        <img src="image/${value.image}"/>
        <div class="title">${value.name}</div>
<div class="price">${value.price.toLocaleString()}</div>
<button onclick
;
        list.appendChild(newDiv);
    })
}

initApp();
function addToCard(key){
    if(listCards[key]== null){
        listCards[key]= products[key];
        listCards[key].quantity =1;
    }
    reloadcard();
}
function reloadCard(){
    listcard.innerHTML =''; 
let count= 0;
let totalPrice = 0;
listCards.forEach((value,key)=> {
    totalPrice =totalPrice + value.price;
    count =count + value.quantity;
})
total.innerText =totalPrice.toLocaleString();
quantity.innerText =count;
}

