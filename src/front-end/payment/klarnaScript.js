// Utility function to send HTTP calls to our back-end API
// const http = ({ method, route, body }, callback) => {
//   let requestData = {
//     method,
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(body)
//   };

//   if (method.toLocaleLowerCase() === "get") {
//     delete requestData.body;
//   }

//   // Timeout after 10 seconds
//   timeout(30000, fetch(`${window.location.origin}${route}`, requestData))
//     .then(res => res.json())
//     .then(data => callback(data))
//     .catch(er => console.log(er));
//   // .catch(er => (errorMessage.innerHTML = er));
// };

// // For connection timeout error handling
// const timeout = (ms, promise) => {
//   return new Promise(function(resolve, reject) {
//     setTimeout(function() {
//       reject(new Error("Connection timeout"));
//     }, ms);
//     promise.then(resolve, reject);
//   });
// };

// KLARNA:
let promiseKlarna = new Promise((resolve, reject) => {
  let client_token;
  http(
    {
      method: "POST",
      route: "/klarnaSession",
      body: {}
    },
    data => {
      client_token = data.client_token;
      console.log("\nClient Token:\n" + client_token);
      if (client_token) resolve(client_token);
    }
  );
}).then(client_token => {
  console.log("\nKlarna...\n");
  window.klarnaAsyncCallback(client_token);
});

window.klarnaAsyncCallback = function(client_token) {
  // INIT
  try {
    Klarna.Payments.init({
      client_token: client_token
    });
  } catch (e) {
    console.log("Init:\n" + e);
  }
  //LOAD...
  try {
    Klarna.Payments.load(
      {
        container: "#klarna_container",
        payment_method_categories: ["pay_later", "pay_over_time"],
        instance_id: "klarna-payments-instance"
      },
      {
        // data
      },
      // callback
      function(response) {
        console.log("Load Success:\n");
        console.log(response);
      }
    );
  } catch (e) {
    console.log("Load:\n" + e);
  }
};

// AUTHORISE
let klarnaAuth = function() {
  try {
    Klarna.Payments.authorize(
      // options
      {
        instance_id: "klarna-payments-instance" // Same as instance_id set in Klarna.Payments.load().
      },
      {
        // data
        billing_address: {
          given_name: "John",
          family_name: "Doe",
          email: "johndoe@email.com",
          title: "Mr",
          street_address: "13 New Burlington St",
          street_address2: "Apt 214",
          postal_code: "W13 3BG",
          city: "London",
          region: "",
          phone: "01895808221",
          country: "GB"
        }
      },
      function(response) {
        console.log("Response token: " + response.authorization_token);
        http(
          {
            method: "POST",
            route: "/klarnaPayment",
            body: {
              authorization_token: response.authorization_token
            }
          },
          data => {
            console.log("Payment Successful:\n");
            console.log(data);
          }
        );
      }
    );
  } catch (e) {
    console.log("Authorise:\n" + e);
  }
};
///// End of Klarna setup
