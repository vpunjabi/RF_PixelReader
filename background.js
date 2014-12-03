// chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
// 	if(message.value == "getPixelData"){
// 		alert("inside if");
// 		var resp = {value: "awesome"};
// 		sendResponse(resp);
// 	}
// });

var reset = false;
var defaultNoData = "No RF Pixel Data";
var urlData = defaultNoData;


// https://20574255p.rfihub.com/ca.gif?rb=9537&ca=20574255&ra=3461315557360649&t=home  HTTP/1.1 200 OK
// https://20560241p.rfihub.com/ca.gif?rb=9537&ca=20560241&ra=635531645644345000  HTTP/1.1 200 OK



chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.value == "getPixelData"){
		var views = chrome.extension.getViews({type: "popup"});
		for (var i = 0; i < views.length; i++) {
		        views[i].document.getElementById('accordion').innerHTML = urlData;
		}
	}
});

// chrome.webNavigation.onBeforeNavigate.addListener(function(details){
// 	if(reset){
// 		urlData = "";
// 		reset = false;
// 	}
// });

// chrome.webNavigation.onDOMContentLoaded.addListener(function(details){
// 	reset = true;
// });

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
// 	//alert(changeInfo.url);
// 	if(changeInfo.url){
// 		urlData = "";
// 	}
// });

chrome.webNavigation.onCommitted.addListener(function(details){
	if(details.transitionQualifiers == "from_address_bar" || details.transitionType == "reload" || details.transitionType == "link" || details.transitionType == "form_submit"){
		urlData = defaultNoData;
	}
});

chrome.webRequest.onHeadersReceived.addListener(
function(details) {
	if(urlData == defaultNoData){
		urlData = "";
	}
	//urlData += details.url + "  " + details.statusLine;
	urlData += formatData(details);

  //alert(document.getElementById("container").innerHTML);
  //document.getElementById("container").innerHTML = details.url + "\n" + document.getElementById("container").innerHTML;
},
{urls: ["<all_urls>"]});




function formatData(pageDetails){
	var returnVal = "<h3>!{HEADING}</h3><div><p>!{DETAILS}</p></div>";

	if(pageDetails && pageDetails.url && pageDetails.url.length > 0){
		returnVal.replace("!{HEADING}", getPixelId(pageDetails.url) + "\t" + getStatusCode(pageDetails.statusLine));
		return returnVal;
	}
	return "";

	// <h3>Section 1</h3>
	// 	<div>
	// 		<p>
	// 		Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer
	// 		ut neque. Vivamus nisi metus, molestie vel, gravida in, condimentum sit
	// 		amet, nunc. Nam a nibh. Donec suscipit eros. Nam mi. Proin viverra leo ut
	// 		odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate.
	// 		</p>
	// 	</div>
}

function getPixelId(pageUrl){
	var patt1 = /\d+p/g;
	var result = pageUrl.match(patt1);

	if(result.length > 0){
		result = result.substring(0, result.length - 1);
	}
	return result;
}

function getStatusCode(statusLine){
	var patt1 = /\d{3}/g;
	var result = pageUrl.match(patt1);

	return result;
}







