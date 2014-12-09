//function setData(data) {
  //alert("inside senddata");
  //document.getElementById('container').innerHTML = data;
//}
//alert("hi");


$(function() {
  $("#accordion").accordion();
});

chrome.runtime.sendMessage({value:"getPixelData"});


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if(message.value == "refreshAccordian"){
    $( "#accordion" ).accordion( "refresh" );
  }
});