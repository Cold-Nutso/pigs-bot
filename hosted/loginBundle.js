(()=>{var e={603:e=>{const t=e=>{document.getElementById("errorMessage").textContent=e,document.getElementById("domoMessage").classList.remove("hidden")};e.exports={handleError:t,sendPostDomo:async(e,a,r)=>{const n=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),s=await n.json();document.getElementById("domoMessage").classList.add("hidden"),s.error&&t(s.error),s.redirect&&(window.location=s.redirect),r&&r(s)},hideError:()=>{document.getElementById("domoMessage").classList.add("hidden")}}}},t={};function a(r){var n=t[r];if(void 0!==n)return n.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,a),s.exports}(()=>{const e=a(603),t=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,n=t.target.querySelector("#_csrf").value;return a&&r?(e.sendPostDomo(t.target.action,{username:a,pass:r,_csrf:n}),!1):(e.handleError("Username or password is empty!"),!1)},r=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,n=t.target.querySelector("#pass2").value,s=t.target.querySelector("#discord").value,c=t.target.querySelector("#premium").checked,o=t.target.querySelector("#_csrf").value;return a&&s&&r&&n?r!==n?(e.handleError("Passwords do not match!"),!1):(e.sendPostDomo(t.target.action,{username:a,pass:r,pass2:n,discord:s,premium:c,_csrf:o}),!1):(e.handleError("All fields are required!"),!1)},n=t=>{t.preventDefault(),e.hideError();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#oldpass").value,n=t.target.querySelector("#pass").value,s=t.target.querySelector("#pass2").value,c=t.target.querySelector("#_csrf").value;return a&&r&&n&&s?n!==s?(e.handleError("New passwords do not match!"),!1):(e.sendPostDomo(t.target.action,{username:a,oldpass:r,pass:n,pass2:s,_csrf:c}),!1):(e.handleError("All fields are required!"),!1)},s=e=>React.createElement("form",{id:"loginForm",name:"loginForm",onSubmit:t,action:"/login",method:"POST",className:"mainForm"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"text",name:"pass",placeholder:"password"}),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Sign in"})),c=e=>React.createElement("form",{id:"signupForm",name:"signupForm",onSubmit:r,action:"/signup",method:"POST",className:"mainForm"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"discord"},"Discord ID: "),React.createElement("input",{id:"discord",type:"text",name:"discord",placeholder:"Your unique Discord ID"}),React.createElement("p",null,"WARNING: Your ID cannot be changed! Get it right the first time."),React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"text",name:"pass",placeholder:"password"}),React.createElement("label",{htmlFor:"pass2"},"Password: "),React.createElement("input",{id:"pass2",type:"text",name:"pass2",placeholder:"retype password"}),React.createElement("label",{htmlFor:"premium"},"Premium Account: "),React.createElement("input",{id:"premium",type:"checkbox",name:"premium"}),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Sign in"})),o=e=>React.createElement("form",{id:"passChangeForm",name:"passChangeForm",onSubmit:n,action:"/passChange",method:"POST",className:"mainForm"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"oldpass"},"Old Password: "),React.createElement("input",{id:"oldpass",type:"text",name:"oldpass",placeholder:"old password"}),React.createElement("label",{htmlFor:"pass"},"New Password: "),React.createElement("input",{id:"pass",type:"text",name:"pass",placeholder:"new password"}),React.createElement("label",{htmlFor:"pass2"},"New Password: "),React.createElement("input",{id:"pass2",type:"text",name:"pass2",placeholder:"retype new password"}),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("input",{className:"formSubmit",type:"submit",value:"Change password"}));window.onload=async()=>{const e=await fetch("/getToken"),t=await e.json(),a=document.getElementById("loginButton"),r=document.getElementById("signupButton"),n=document.getElementById("passChangeButton");a.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(s,{csrf:t.csrfToken}),document.getElementById("content")),!1))),r.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(c,{csrf:t.csrfToken}),document.getElementById("content")),!1))),n.addEventListener("click",(e=>(e.preventDefault(),ReactDOM.render(React.createElement(o,{csrf:t.csrfToken}),document.getElementById("content")),!1))),ReactDOM.render(React.createElement(s,{csrf:t.csrfToken}),document.getElementById("content"))}})()})();