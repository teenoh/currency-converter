let currency_list = [];
let currency_1_select = document.querySelector("#currency_1");
let currency_2_select = document.querySelector("#currency_2");
let result_input = document.querySelector("#result");
let amount_input = document.querySelector("#amount");
let conversion_display = document.querySelector("#conversion_display");
let loader = document.querySelector("#loader");
const API_URL = "https://free.currencyconverterapi.com/api/v5";

//updates the select fields 
let updateSelect = currency_list => {
  console.log(currency_list);

  if (Object.keys(currency_list).length !== 0) {
    for (let currency in currency_list) {
      let new_option = new Option(
        currency_list[currency]["currencyName"],
        currency_list[currency]["id"]
      );
      let new_option_2 = new_option.cloneNode(true);

      new_option.innerHTML += ` <i class="right">${
        currency_list[currency]["id"]
      }</i>`;

      currency_1_select.options[currency_1_select.options.length] = new_option;
      currency_2_select.options[
        currency_2_select.options.length
      ] = new_option_2;
    }
  }
};


//dbPromise
let dbPromise = idb.open("currency-converter", 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      let rateStore = upgradeDB.createObjectStore("rates");
  }
});

console.log(dbPromise)

let storeRate = (query, rate) => {
  let query_currencies = query.split("_");

  dbPromise
    .then(db => {
      let tx = db.transaction("rates", "readwrite");
      let rateStore = tx.objectStore("rates");

      if (query_currencies[0] == query_currencies[1]){
        rateStore.put(parseFloat(rate).toFixed(6), query);
        return tx.complete;
      }

      rateStore.put(parseFloat(rate).toFixed(6), query);
      rateStore.put(
        parseFloat(1 / rate).toFixed(6),
        `${query_currencies[1]}_${query_currencies[0]}`
      );
      return tx.complete;
    })
    .then(() => console.log("currency rates have been stored for =>", query))
    .catch((err) => console.log("Error occured when saving query to db", err));
};


let updateDisplay = (rate, query) => {
  console.log("convert oooooo");
  conversion_display.classList.remove("hide");
  let currencies = query.split("_");
  console.log(currencies, rate);

  conversion_display.innerHTML = `<p class="center-align">${currency_list[
    currencies[0]
  ]["currencySymbol"] || currencies[0]} 1 (${
    currencies[0]
  })  =  ${currency_list[currencies[1]]["currencySymbol"] ||
    currencies[1]} ${rate} (${currencies[1]})</p>`;

  if (!amount_input.value) {
    M.toast({ html: "No amount was selected" });
    return;
  }

  console.log(parseFloat(amount_input.value * rate).toFixed(6));
  result_input.value = parseFloat(amount_input.value * rate).toFixed(3);
  M.updateTextFields();
};

let getRatesOnline = (query) => {
  fetch(`${API_URL}/convert?q=${query}&compact=ultra`)
    .then(res => res.json())
    .then(res => {
      console.log(res);
      let rate = res[query];
      loader.classList.add("hide");
      updateDisplay(rate, query);
      //store rate in db
      storeRate(query, rate);
    })
    .catch(err => {
      loader.classList.add("hide");
      M.toast({ html: "You aren't connected to the internet and this conversion hasn't been saved" });
      console.log("An error occured, ", err);
    });
};

let convert = () => {
  if (!currency_1_select.value || !currency_2_select.value) {
    M.toast({ html: "You didnt select two currencies!" });
    return;
  }

  let query = `${currency_1_select.value}_${currency_2_select.value}`;
  let rate;

  //remove  conversion detail
  if (!conversion_display.classList.contains("hide")) {
    conversion_display.classList.add("hide");
  }

  //display loading icon
  loader.classList.remove("hide");

  dbPromise
    .then(db => {
      let tx = db.transaction("rates");
      let rateStore = tx.objectStore("rates");
      return rateStore.get(query);
    })
    .then(rate => {
      console.log(rate);

      if (!rate) {
        getRatesOnline(query)
        return;
      }

      loader.classList.add("hide");
      updateDisplay(rate, query)
      console.log(`got rate for query ${query} from db`)
    });
};


document.addEventListener("DOMContentLoaded", function() {
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
});

// console.log("currency list ==> ", currency_list);
