"use strict";

let addUrlButton = document.getElementById("add-button");
let addUrlText = document.getElementById("add-url-text");

let markUrlButton = document.getElementById("mark-button");
let markUrlText = document.getElementById("mark-url-text");

let deviceIp = document.getElementById("device-ip")
let deviceDiskCapacity = document.getElementById("device-disk-capacity")
let deviceDiskCached = document.getElementById("device-disk-cached")
let deviceDiskTimestamp = document.getElementById("device-disk-timestamp")

let errorTab = document.getElementById("error");
let activeTab = document.getElementById("active");
let finishedTab = document.getElementById("finished");
let item;

let gidList = [];
let activeList = [];

const mainUrl = "http://127.0.0.1:6802";
const deviceInfoUrl = new URL(`${mainUrl}/`);
const statusUrl = new URL(`${mainUrl}/download/status`);
const activeUrl = new URL(`${mainUrl}/download/status/active`);
const addDownloadUrl = new URL(`${mainUrl}/download/add`);
const markUrl = new URL(`${mainUrl}/download/mark`);


let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

function createData(data) {

    let download = data["download"];
    let display = "none";
    let progress = 0;

    if (download !== null) {
        download = data["download"]["status"];
        progress = calcDownloadProgress(data["download"]);
        if (progress !== "NaN") {
            display = "block";
        }
    }

    let src = getDataExtension(data["url"]);

    let obj = `<img class="file-type" src="${src}" alt="type-img"></img><div class='item-detail'>
    <label class="labelArea" style='padding-top:20px'>URL: ${data["url"]}</label>
    <label class="labelArea">GID: ${data["gid"]}</label>
    <label class="labelArea">PRIORITY: ${data["priority"]}</label>
    <label class="labelArea">STATUS: ${data["status"]}</label>
    <label class="labelArea">ADDED: ${data["added"]}</label>
    <label class="labelArea">DOWNLOAD: ${download}</label>
    <label class="labelArea">FILE: ${data["file"]}</label>
    <label class="labelArea">PATH: ${data["path"]}</label>
    <label class="labelArea">SIZE: ${data["size"]}</label>
    <label class="labelArea" style='padding-bottom:20px'>USING: ${data["using"]}</label></div>
    <div class="progress-container" style="display:${display}"><div class="progress" id="${data["gid"]}-progress" style="width:${progress}%">%${progress}</div></div>
    `

    return obj
}

function getDataExtension(url) {
    let fileExtension = url.split(".")[url.split(".").length - 1];
    if (fileExtension === "mkv" || fileExtension === "mp4") {
        return "video-logo.png";
    } else if (fileExtension === "jpg" || fileExtension === "png" || fileExtension === "jpeg" || fileExtension === "svg") {
        return "photo-logo.png";
    } else {
        return "";
    }
}

function calcDownloadProgress(data) {
    let totalLength = data["totalLength"];
    let downloadedLength = data["completedLength"];
    let progress = (downloadedLength / totalLength) * 100;
    progress = progress.toFixed(2);

    return progress;
}

function updateActiveDownloadProgress() {
    activeList.forEach(element => {
        let item = document.getElementById(`${element["gid"]}-progress`)
        let progress = calcDownloadProgress(element["download"])
        item.innerText = `%${progress}`;
        item.style.width = `${progress}%`;
    });
}

async function getDownloadsList() {
    let response = await fetch(statusUrl);
    let activeResponse = await fetch(activeUrl);

    if (response.status === 200) {
        let data = await response.json();
        activeList = await activeResponse.json();

        data.forEach(element => {
            if (!gidList.includes(element["gid"])) {
                item = document.createElement("div");
                item.classList.add("item");
                gidList.push(element["gid"]);
                item.setAttribute("id", element["gid"]);
                item.innerHTML = createData(element);
            }

            if (element["status"] === 0) {
                activeTab.appendChild(item);
            } else if (element["status"] === 1) {
                activeTab.appendChild(item);
            } else if (element["status"] === 2) {
                finishedTab.appendChild(item);
            } else if (element["status"] === 3) {
                errorTab.appendChild(item);
            } else if (element["status"] === 4) {
                errorTab.appendChild(item);
            }
        })
    }
}

async function addDownload(url) {
    let data = { url: `${url}` };

    let response = await fetch(addDownloadUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    });
    if (response.status === 200) {
        alert(`"${url}" added to download list!`);
        location.reload();
    } else {
        alert(`An error occurred while adding the "${url}" to the download list!`);
    }
}

addUrlButton.addEventListener('click', function() {
    addDownload(addUrlText.value);
})

async function markDownload(urls) {
    let data = { urls: urls };

    let response = await fetch(markUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    });
    if (response.status === 200) {
        alert(`"${urls.length}" url marked!`);
        location.reload();
    } else {
        alert(`An error occurred while marking the "${urls.length}" url!`);
    }
}

markUrlButton.addEventListener('click', function() {
    let markList = markUrlText.value.split(",");
    markDownload(markList);
})

window.setInterval(function() {
    getDownloadsList();
    getDeviceIp();
    getDeviceStatus();
    updateActiveDownloadProgress();
}, 1000);

function getDeviceIp() {
    let deviceIpBasic = mainUrl.split("//")[1]
    deviceIp.innerText = `IP: ${deviceIpBasic}`;
}

async function getDeviceStatus() {
    let response = await fetch(deviceInfoUrl);
    if (response.status === 200) {
        let data = await response.json();

        let total_capacity = data["disk"]["total_capacity"];
        let cached = data["disk"]["cached"];
        let year = data["timestamp"].split("T")[0].split("-");
        year = year[2] + "/" + year[1] + "/" + year[0];
        let hour = data["timestamp"].split("T")[1].split(".")[0];
        let timestamp = year + " " + hour

        deviceDiskCapacity.innerText = `T. CAPACITY: ${total_capacity}`;
        deviceDiskCached.innerText = `CACHED: ${cached}`;
        deviceDiskTimestamp.innerText = `${timestamp}`;
    } else {
        alert(`An error occurred while getting device information !`);
    }
}