// ==UserScript==
// @name          Tagpro Time Manager
// @namespace     http://www.reddit.com/user/bicycle/
// @grant         GM_setValue
// @grant         GM_getValue
// @description   Provides several time management options to help regulate the amount of time spent playing Tagpro.
// @include       http://tagpro-*.koalabeast.com/games/find
// @include       http://tagpro-*.koalabeast.com/games/find?r=*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        bicycle
// @version       0.1.1
// ==/UserScript==

//--------------------------------------------------------------------//
//You shouldn't have to modify anything in here as a typical user!

//Simply press Activate on the game loading screen and the loader will
//stop placing you in games once you go over the time limit you set.
//--------------------------------------------------------------------//

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

//-- Only run in the top page, not the various iframes.
if (window.top === window.self) {
    window.addEventListener("message", receiveTimeMessage, false);
}

//-- Continuously checking for messages and editing page elements
window.setInterval(function(){
    let et = GM_getValue("endtime");
    if(Number(et) !== 0) {
        let bordercolor;
        let tm = Date.now();
        if(Number(tm) >= Number(et)) {
            bordercolor = "green";
            document.getElementById('endtime').style.border = "1px dashed " + bordercolor;
            expiredTime();
            deactivate();
        } else if(Number(Number(et) - Number(tm)) < 300000) {
            bordercolor = "red";
            document.getElementById('endtime').style.border = "1px dashed " + bordercolor;
            document.getElementById('activatebtn').style.display = 'none';
            document.getElementById('deactivatebtn').style.display = 'inline';
        } else if(Number(Number(et) - Number(tm)) < 1500000) {
            bordercolor = "yellow";
            document.getElementById('endtime').style.border = "1px dashed " + bordercolor;
            document.getElementById('activatebtn').style.display = 'none';
            document.getElementById('deactivatebtn').style.display = 'inline';
        }
        document.getElementById('endtime').innerHTML = getStringTime(Number(et) - Number(tm)) + " REMAINING";
    }
}, 500);


//-------------------------//
function addGlobalStyle(css) {
    let head = document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function addGlobalScript(code) {
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = code;
    head.appendChild(script);
}
//-------------------------//

function expiredTime() {
    GM_setValue("endtime", 0);
    alert("You have reached your TagPro time limit for now. Good luck in the real world!");
    window.location = window.location.origin;
}

function receiveTimeMessage(event) {
    let messageJSON;
    try {
        messageJSON = JSON.parse(event.data);
    } catch(zError) { }

    if(!messageJSON) return;

    let safeValue = JSON.stringify(messageJSON.time);
    GM_setValue("endtime", safeValue);
    if(Number(safeValue) !== 0) {
        console.log("TagPro Time Manager has been activated for " + Math.round((Number(safeValue) - Number(Date.now())) / 60000) + " minutes.");
    }
}

function activate() {
    let mins = prompt("How many minutes would you like to play for?", "");
    if(mins !== null) {
        let msecs = (Number(mins) * 60000);
        let currtime = Date.now();
        let endtime = (Number(currtime) + Number(msecs));
        let messageTxt = JSON.stringify({time: endtime});
        window.postMessage(messageTxt, "*");
        document.getElementById('activatebtn').style.display = 'none';
        document.getElementById('deactivatebtn').style.display = 'inline';
    }
}

function deactivate() {
    let messageTxt = JSON.stringify({time: 0});
    window.postMessage(messageTxt, "*");
    document.getElementById('endtime').innerHTML = "--:--:-- REMAINING";
    document.getElementById('activatebtn').style.display = 'inline';
    document.getElementById('deactivatebtn').style.display = 'none';
    document.getElementById('endtime').style.border = "1px dashed green";
}

function getStringTime(time) {
    if(time > 86400000) {
        time = 86400000;
    } else if(time < 0) {
        time = 0;
    }
    let sec = Math.round((Number(time) / 1000) - 1) % 60;
    if(Number(sec) < 10) {
        sec = "0" + sec;
    }
    let min = Math.floor((Number(time) / 1000) / 60) % 60;
    if(Number(min) < 10) {
        min = "0" + min;
    }
    let hr = Math.floor(Number(time) / 1000 / 60 / 60) % 24;
    if(Number(hr) < 10) {
        hr = "0" + hr;
    }
    return (hr + ":" + min + ":" + sec);
}

//-------------------------//
addGlobalStyle(`#timemgr {
    font-size: 16px;
    color: #DEDEDE;
    margin-left: 8%;
    font-weight: bold;
    text-shadow: 0 2px 3px #7F35A6;
}`);

addGlobalStyle(`.mgrbtn {
    margin-left: 0.5%;
    text-shadow: none;
}`);

addGlobalStyle(`.redbtn {
    background: red;
    border-color: darkred;
    box-shadow: 0 3px darkred;
}`);

addGlobalStyle(`#endtime {
    position: relative;
    top: -1px;
    margin-right: 10px;
    margin-left: 10px;
    padding: 4px;
    font-size: 12px;
    text-shadow: none;
    border: 1px dashed green;
}`);

addGlobalStyle(`.redbtn:hover, .redbtn:focus, .redbtn:active {
    background: #EA3434 !important;
}`);

$('div.joiner').before(`<div align='left' id='timemgr'>
    TAGPRO TIME MANAGER 
    <span id='endtime'>
        --:--:-- REMAINING
    </span>
    <a href='#' id='activatebtn' class='btn mgrbtn'>
        ACTIVATE
    </a> 
    <a href='#' id='deactivatebtn' class='btn mgrbtn redbtn' style='display: none;'>
        DEACTIVATE
    </a>
</div>`);

document.getElementById('activatebtn').addEventListener('click', activate, false);
document.getElementById('deactivatebtn').addEventListener('click', deactivate, false);
//-------------------------//
