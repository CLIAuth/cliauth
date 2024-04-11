const form = document.getElementById("loginForm");
const errorBox = document.getElementById("errorBox");
const mainContent = document.getElementById("mainContent");
const loadingBox = document.getElementById("loadingBox");
const otpValue = document.getElementById("otpValue");
const params = new URLSearchParams(window.location.search);

function afterLogin(result){
  if (result){
    mainContent.style.display = "none";
    loadingBox.style.display = "block";
    otpValue.value = params.get("otp");
    form.submit();
  }
  else{
    errorBox.innerText = "Could not authenticate. Please try again.";
  }
}