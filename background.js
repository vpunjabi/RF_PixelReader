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
	if(details.transitionType == "start_page" || details.transitionType == "typed" || details.transitionQualifiers == "from_address_bar" || details.transitionType == "reload" || details.transitionType == "link" || details.transitionType == "form_submit"){
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
	if(url && url.length > 0 && getPixelId(url).length > 0 && url.indexOf("p.rfihub.com/ca") >= 0){
		returnVal = true;
	}
	return returnVal;
}

function formatData(pageDetails){
	var returnVal = "<h3>!{PixelId}<span class='right'>!{HTTPCode}</span></h3><div><p>!{DETAILS}</p><p>!{PixelURL}</p></div>";

	//return "> " + getPixelId(pageDetails.url);

	if(pageDetails && pageDetails.url && pageDetails.url.length > 0){
		returnVal = returnVal.replace("!{PixelId}", getPixelId(pageDetails.url)).replace("!{HTTPCode}", getStatusCode(pageDetails.statusLine));

		var params = getPixelDetails(pageDetails.url);
		var pixelDisplay = [];
		for(var i in params){
			var rowHTML = "";
			rowHTML = formatRowDataToHTML(i, "left", 10) + formatRowDataToHTML(params[i], "right", 25);
			if(rowHTML.length){
				pixelDisplay.push(rowHTML);
			}
		}

		//returnVal = returnVal.replace("!{DETAILS}", pixelDisplay.join("<br>")).replace("!{PixelURL}", "<br /><span class='left' style='font-size:12px'><strong>Request URL:</strong></span><br /><span class='left' style='font-size:11px'><INPUT style='border-width: 1px' size='50' READONLY VALUE='" + pageDetails.url + "'></span>");;
		returnVal = returnVal.replace("!{DETAILS}", pixelDisplay.join("<br>")).replace("!{PixelURL}", "<br /><span class='left' style='font-size:12px'><strong>Request URL:</strong></span><br />" + formatRowDataToHTML(pageDetails.url, "left", 42));;
	}else{
		returnVal = "";
	}
	return returnVal;
}
//maxCharLength before switching to input text field
function formatRowDataToHTML(dataVal, align, maxCharLength){
	var returnVal = "";
	if((dataVal + "").length > 0){
		if((align + "").toLowerCase() == "right"){
			returnVal += "<span class='right'>";
		}else{
			returnVal += "<span class='left'>";
		}
		if((dataVal + "").length > maxCharLength){
			returnVal += "<INPUT style='border-width: 1px' size='" + maxCharLength + "' READONLY VALUE='" + (dataVal + "") + "'>";
		}else{
			returnVal += (dataVal + "");
		}
		returnVal += "</span>";
	}
	return returnVal;
}
function getPixelId(pageUrl){
	var params = getPixelDetails(pageUrl);
	if(params && params["ca"]){
		return params["ca"];
	}
	return null;
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
	var params = {};

	if(pageUrl.length > 0 && pageUrl.split("?")[1]){
		var temp = (pageUrl.split("?")[1] + "").split("&");
		for(var i in temp){
			params["" + (temp[i] + "").split("=")[0]] = ""+ (temp[i] + "").split("=")[1];
		}
	}
	return params;
}
