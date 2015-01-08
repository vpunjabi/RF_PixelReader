var reset = false;
var defaultNoData = "No RF Pixel Data";
var urlData = defaultNoData;
var pixelCounter = 0;


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.value == "getPixelData"){
		var views = chrome.extension.getViews({type: "popup"});
		for (var i = 0; i < views.length; i++) {
		        views[i].document.getElementById('accordion').innerHTML = urlData;
		}
		chrome.runtime.sendMessage({value:"refreshAccordian"});
	}
});


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
		urlData += formatData(details);
		chrome.browserAction.setBadgeText({text: "" + ++pixelCounter});
	}
},
{urls: ["<all_urls>"]});


function isPixelUrl(url){
	var returnVal = false;
	if(url && url.length > 0 && getPixelId(url).length > 0 && url.indexOf("p.rfihub.com/ca") >= 0){
		returnVal = true;
	}
	return returnVal;
}

var colorSwatch = ["#0000FF", "#00CCFF"];
var rowCounter;

function formatData(pageDetails){
	var returnVal = "<h3>!{PixelId}<span class='right'>!{HTTPCode}</span></h3><div><p>!{DETAILS}</p><p>!{PixelURL}</p></div>";
	rowCounter = 0;

	if(pageDetails && pageDetails.url && pageDetails.url.length > 0){
		returnVal = returnVal.replace("!{PixelId}", getPixelId(pageDetails.url)).replace("!{HTTPCode}", getStatusCode(pageDetails.statusLine));

		var params = getPixelDetails(pageDetails.url);
		var pixelDisplay = [];
		for(var i in params){
			var rowHTML = "";
			var rowColor = (rowCounter++)%colorSwatch.length;
			rowHTML = formatRowDataToHTML(i, "left", 10, colorSwatch[rowColor]) + formatRowDataToHTML(params[i], "right", 25, colorSwatch[rowColor]);
			if(rowHTML.length){
				pixelDisplay.push(rowHTML);
			}
		}
		returnVal = returnVal.replace("!{DETAILS}", pixelDisplay.join("<br>")).replace("!{PixelURL}", "<br /><span class='left' style='font-size:12px'><strong>Request URL:</strong></span><br />" + formatRowDataToHTML(pageDetails.url, "left", 42));;
	}else{
		returnVal = "";
	}
	return returnVal;
}
//maxCharLength before switching to input text field
function formatRowDataToHTML(dataVal, align, maxCharLength, color){
	var returnVal = "";
	if((dataVal + "").length > 0){
		if((align + "").toLowerCase() == "right"){
			returnVal += "<span class='right'";
		}else{
			returnVal += "<span class='left'";
		}
		if(("" + color).length){
			returnVal += "style=\"color:" + color + "\"";
		}
		returnVal += ">";
		if((dataVal + "").length > maxCharLength){
			if(("" + color).length){
				returnVal += "<INPUT READONLY type=\"text\" STYLE=\"border-width: 1px; color: " + color + ";\" size=\"" + maxCharLength + "\" value=\"" + (dataVal + "") + "\">";
			}else{
				returnVal += "<INPUT style='border-width: 1px' size='" + maxCharLength + "' READONLY VALUE='" + (dataVal + "") + "'>";
			}
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
