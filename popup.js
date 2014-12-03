//function setData(data) {
  //alert("inside senddata");
  //document.getElementById('container').innerHTML = data;
//}
//alert("hi");


$(function() {
  $("#accordion").accordion();
});

chrome.runtime.sendMessage({value:"getPixelData"});