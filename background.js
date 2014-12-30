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
var pixelCounter = 0;


// https://20574255p.rfihub.com/ca.gif?rb=9537&ca=20574255&ra=3461315557360649&t=home  HTTP/1.1 200 OK
// https://20560241p.rfihub.com/ca.gif?rb=9537&ca=20560241&ra=635531645644345000  HTTP/1.1 200 OK



chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.value == "getPixelData"){
		var views = chrome.extension.getViews({type: "popup"});
		for (var i = 0; i < views.length; i++) {
		        views[i].document.getElementById('accordion').innerHTML = urlData;
		}
		chrome.runtime.sendMessage({value:"refreshAccordian"});
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

chrome.browserAction.setBadgeBackgroundColor({color: "#36B7F9"});

chrome.webNavigation.onCommitted.addListener(function(details){
	if(details.transitionType == "typed" || details.transitionQualifiers == "from_address_bar" || details.transitionType == "reload" || details.transitionType == "link" || details.transitionType == "form_submit"){
		urlData = defaultNoData;
		pixelCounter = 0;
		chrome.browserAction.setBadgeText({text: ""});
	}
});

chrome.webRequest.onHeadersReceived.addListener(
function(details) {
	if(isPixelUrl(details.url)){
		if(urlData == defaultNoData){
			urlData = "";
		}
		//urlData += details.url + "  " + details.statusLine;
		urlData += formatData(details);
		chrome.browserAction.setBadgeText({text: "" + ++pixelCounter});
	}

  //alert(document.getElementById("container").innerHTML);
  //document.getElementById("container").innerHTML = details.url + "\n" + document.getElementById("container").innerHTML;
},
{urls: ["<all_urls>"]});


function isPixelUrl(url){
	var returnVal = false;
	if(url && url.length > 0 && getPixelId(url).length > 0 && url.indexOf("rfihub.com/ca.gif") >= 0){
		returnVal = true;
	}
	return returnVal;
}

function formatData(pageDetails){
	var returnVal = "<h3>!{PixelId}<span class='right'>!{HTTPCode}</span></h3><div><p>!{DETAILS}</p></div>";

	//return "> " + getPixelId(pageDetails.url);

	if(pageDetails && pageDetails.url && pageDetails.url.length > 0){
		returnVal = returnVal.replace("!{PixelId}", getPixelId(pageDetails.url)).replace("!{HTTPCode}", getStatusCode(pageDetails.statusLine));

		var params = getPixelDetails(pageDetails.url);
		for(var i in params){
			params[i] = "<span class='left'>" + (params[i] + "").split("=")[0] + "</span><span style='color:#1fdc5d' class='right'>" + (params[i] + "").split("=")[1] + "</span>";
		}

		returnVal = returnVal.replace("!{DETAILS}", params.join("<br>"));
	}else{
		returnVal = "";
	}
	return returnVal;
}

function getPixelId(pageUrl){
	var patt1 = /\d+p/g;
	var result = pageUrl.match(patt1);

	if(result.length > 0 && result[0].length > 0){
		result = result[0].substring(0, result[0].length - 1);
	}else{
		result = "";
	}
	return result;
}

function getStatusCode(statusLine){
	var patt1 = /\d{3}/g;
	var result = statusLine.match(patt1);

	if(result.length < 1 || result[0].length < 1){
		result = "";
	}
	return result;
}

function getPixelDetails(pageUrl){
	var params = null;

	if(pageUrl.length > 0 && pageUrl.split("?")[1]){
		params = (pageUrl.split("?")[1] + "").split("&");
	}
	return params;
}






