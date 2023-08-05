cons inputs = document.querySelectorAll(".contact-input");

inputs.forEach(ipt => {
    ipt.addEventListener("focus", ()=>{
        ipt.parentNode.classList.add("focus");
    })
})