let currency_list = [];
let currency_1_select = document.querySelector("#currency_1");
let currency_2_select = document.querySelector("#currency_2");
let conversion_display = document.querySelector("#conversion_display");
let loader = document.querySelector("#loader");

const API_URL = "https://free.currencyconverterapi.com/api/v5"

let updateSelect = currency_list => {
  console.log(currency_list);

  if (Object.keys(currency_list).length !== 0) {
    for (let currency in currency_list) {
      let new_option = new Option(
        currency_list[currency]["currencyName"],
        currency_list[currency]["id"]
      );
      let new_option_2 = new_option.cloneNode(true)

      new_option.innerHTML += ` <i class="right">${currency_list[currency]["id"]}</i>`;

      currency_1_select.options[currency_1_select.options.length] = new_option;
      currency_2_select.options[currency_2_select.options.length] = new_option_2;

    }
  }
};

let updateDisplay = (rate, query) => {
    console.log("convert oooooo")
    conversion_display.classList.remove('hide')
    let currencies = query.split('_')
    console.log(currencies, rate)
    conversion_display.innerHTML = `<h3 class="center-align">${currency_list[currencies[0]]['currencySymbol'] || currencies[0] } 1 (${currencies[0]}) <br /><br/ > = <br/><br/> ${currency_list[currencies[1]]['currencySymbol'] || currencies[1] } ${rate} (${currencies[1]})</h3>`
}

let convert = () => {
    if (!currency_1_select.value || !currency_2_select.value){
        M.toast({html: 'You didnt select two currencies!'})
        return
    }

    let query = `${currency_1_select.value}_${currency_2_select.value}`
    let rate

    //remove  conversion detail
    if (!conversion_display.classList.contains('hide')){
        conversion_display.classList.add("hide")
    }

    //display loading icon
    loader.classList.remove('hide')

    fetch(`${API_URL}/convert?q=${query}&compact=ultra`)
        .then(res => res.json())
        .then(res => {
            console.log(res)
            let rate = res[query]
            loader.classList.add('hide')
            updateDisplay(rate, query)
        })
        .catch(err => {
            M.toast({html: 'An error occured!'})
            console.log("An error occured, ", err)
        })
    
}



document.addEventListener("DOMContentLoaded", function() {
  let select_elems = document.querySelectorAll("select");
  var sidenav_elems = document.querySelectorAll(".sidenav");

  let select_instances = M.FormSelect.init(select_elems);
  var sidenav_instances = M.Sidenav.init(sidenav_elems);
});

fetch(`${API_URL}/currencies`)
  .then(res => res.json())
  .then(res => {
    currency_list = res.results;
    updateSelect(currency_list);
    M.AutoInit();
    return;
  })
  .catch(err => {
    // M.toast({html: 'An error occured when fetching currencies'})
    console.log("An error occured when fetching currencies", err);
    currency_list = [];
  });

console.log("currency list ==> ", currency_list);
