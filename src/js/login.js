
    const baseurl = "http://localhost:8080" //"https://data.mongodb-api.com/app/data-xnrok/endpoint/data/v1";

let registerUser = (event) => {
    event.preventDefault();

    var id = document.getElementById('signup_uid').value;
    var uname = document.getElementById('signup_uname').value;
    var password = document.getElementById('signup_pwd').value;
    var role = document.getElementById('signup_role').value;
    console.log(id, uname, password, role);



    var myHeaders = getHeaders();

    var raw = JSON.stringify({uname,password,role,id,address: "",isLoggedId: false});

    var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};

    fetch(`${baseurl}/user`, requestOptions)
      .then(response => response.text())
      .then(result =>{ console.log(result);$( "#loginlabel" ).trigger( "click" );    })
      .catch(error => console.log('error', error));
}

let loginUser = (event) =>{
    event.preventDefault();

    var id = document.getElementById('login_uid').value;
    var password = document.getElementById('login_pwd').value;

    var myHeaders = getHeaders();
    var raw = JSON.stringify({id,password});
    var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    fetch(`${baseurl}/login`, requestOptions)
    .then(response => response.text())
    .then(result =>{ 
        if(result ==='true') 
            window.location.replace("http://localhost:3000/index.html"); 
        else
            alert("Invalid Credentials! Try Again.")
        })
    .catch(error => console.log('error', error));

}
let getHeaders = () =>{
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    return myHeaders;
}
document.getElementById("signup").onclick = registerUser;
document.getElementById("loginbtn").onclick = loginUser;
