const form = document.getElementById("loginForm");

function afterLogin(result){
  if (result){
    form.submit();
  }
  else{
    errorBox.innerText = "Could not authenticate. Please try again.";
  }
}