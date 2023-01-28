let baseurl =  "http://localhost:8080";//"https://data.mongodb-api.com/app/data-xnrok/endpoint/data/v1";


let registerUser = (event) => {
    event.preventDefault();

    var id = document.getElementById('signup_uid').value;
    var uname = document.getElementById('signup_uname').value;
    var password = document.getElementById('signup_pwd').value;
    var role = document.getElementById('signup_role').value;
    var addr = document.getElementById('signup_addr').value;
    console.log(id, uname, password, role, addr);



    var myHeaders = getHeaders();

    var raw = JSON.stringify({ uname, password, role, id, address: addr, isLoggedId: false });

    var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };

    fetch(`${baseurl}/user`, requestOptions)
        .then(response => response.text())
        .then(result => { console.log(result); $("#loginlabel").trigger("click"); })
        .catch(error => console.log('error', error));
}

let loginUser = (event) => {
    event.preventDefault();

    var id = document.getElementById('login_uid').value;
    var password = document.getElementById('login_pwd').value;

    var myHeaders = getHeaders();
    var raw = JSON.stringify({ id, password });
    var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };
    fetch(`${baseurl}/login`, requestOptions)
        .then(response => response.text())
        .then(result => {
            if (result === 'true'){
                setCookie("id", id, 10);
                window.location.replace("verify.html");
                }
            else
                alert("Invalid Credentials! Try Again.")
        })
        .catch(error => console.log('error', error));

}
let getHeaders = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    return myHeaders;
}
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
document.getElementById("signup").onclick = registerUser;
document.getElementById("loginbtn").onclick = loginUser;
