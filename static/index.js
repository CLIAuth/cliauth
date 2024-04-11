
if (document.querySelector(".popup").offsetWidth*1.07 < window.innerWidth){
  document.querySelector(".popup").classList.add("cssZoomEligible");
}

function visitPage(){
  document.querySelector(".outsidePopup").style.opacity = "0";
  setTimeout(function(){window.open("https://cliauth.readthedocs.io", "_blank");}, 1000);
  setTimeout(function(){document.querySelector(".outsidePopup").style.display = "none";}, 500);
  setTimeout(function(){document.querySelector(".loadText").style.opacity = "100%"}, 2500);
  setTimeout(function(){document.querySelector(".loadLastResort").style.opacity = "100%"}, 4500);
}
