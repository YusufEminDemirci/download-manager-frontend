"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let addUrlButton = document.getElementById("add-button");
let addUrlText = document.getElementById("add-url-text");
let markUrlButton = document.getElementById("mark-button");
let markUrlText = document.getElementById("mark-url-text");
let deviceIp = document.getElementById("device-ip");
let deviceDiskCapacity = document.getElementById("device-disk-capacity");
let deviceDiskCached = document.getElementById("device-disk-cached");
let deviceDiskTimestamp = document.getElementById("device-disk-timestamp");
let errorTab = document.getElementById("error");
let activeTab = document.getElementById("active");
let finishedTab = document.getElementById("finished");
let item;
let gidList = [];
let activeList = [];
const mainUrl = "http://127.0.0.1:6802";
const deviceInfoUrl = new URL(`${mainUrl}/`).toString();
const statusUrl = new URL(`${mainUrl}/download/status`).toString();
const activeUrl = new URL(`${mainUrl}/download/status/active`).toString();
const addDownloadUrl = new URL(`${mainUrl}/download/add`).toString();
const markUrl = new URL(`${mainUrl}/download/mark`).toString();
let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};
function createData(data) {
    let download = data["download"];
    let display = "none";
    let progress = "0";
    if (download !== null) {
        download = data["download"]["status"];
        progress = String(calcDownloadProgress(data["download"]));
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
    `;
    return obj;
}
function getDataExtension(url) {
    let fileExtension = url.split(".")[url.split(".").length - 1];
    if (fileExtension === "mkv" || fileExtension === "mp4") {
        return "video-logo.png";
    }
    else if (fileExtension === "jpg" || fileExtension === "png" || fileExtension === "jpeg" || fileExtension === "svg") {
        return "photo-logo.png";
    }
    else {
        return "";
    }
}
function calcDownloadProgress(data) {
    let totalLength = data["totalLength"];
    let downloadedLength = data["completedLength"];
    let progress = (downloadedLength / totalLength) * 100;
    let progressText = progress.toFixed(2);
    return progressText;
}
function updateActiveDownloadProgress() {
    activeList.forEach(element => {
        let item = document.getElementById(`${element["gid"]}-progress`);
        let progress = calcDownloadProgress(element["download"]);
        if (item !== null) {
            item.innerText = `%${progress}`;
            item.style.width = `${progress}%`;
        }
    });
}
function getDeviceIp() {
    let deviceIpBasic = mainUrl.split("//")[1];
    deviceIp.innerText = `IP: ${deviceIpBasic}`;
}
////////////////////////////////////////////////////
function getDownloads() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(statusUrl);
        if (response.status === 200) {
            let data = yield response.json();
            return data;
        }
        return;
    });
}
function addDownload(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = { url: `${url}` };
        let response = yield fetch(addDownloadUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });
        if (response.status === 200) {
            alert(`"${url}" added to download list!`);
            location.reload();
        }
        else {
            alert(`An error occurred while adding the "${url}" to the download list!`);
        }
    });
}
function markDownload(urls) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = { urls: urls };
        let response = yield fetch(markUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });
        if (response.status === 200) {
            alert(`"${urls.length}" url marked!`);
            location.reload();
        }
        else {
            alert(`An error occurred while marking the "${urls.length}" url!`);
        }
    });
}
function getDeviceStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(deviceInfoUrl);
        if (response.status === 200) {
            let data = yield response.json();
            let total_capacity = data["disk"]["total_capacity"];
            let cached = data["disk"]["cached"];
            let year = data["timestamp"].split("T")[0].split("-");
            year = year[2] + "/" + year[1] + "/" + year[0];
            let hour = data["timestamp"].split("T")[1].split(".")[0];
            let timestamp = year + " " + hour;
            deviceDiskCapacity.innerText = `T. CAPACITY: ${total_capacity}`;
            deviceDiskCached.innerText = `CACHED: ${cached}`;
            deviceDiskTimestamp.innerText = `${timestamp}`;
        }
        else {
            alert(`An error occurred while getting device information !`);
        }
    });
}
function createDownloadItem(data) {
    data.forEach((element) => {
        if (!gidList.includes(element["gid"])) {
            item = document.createElement("div");
            item.classList.add("item");
            gidList.push(element["gid"]);
            item.setAttribute("id", element["gid"]);
            return element;
        }
        else {
            return null;
        }
    });
}
function displayDownloads(element) {
    if (element !== null) {
        item.innerHTML = createData(element);
        if (element["status"] === 0) {
            activeTab.appendChild(item);
        }
        else if (element["status"] === 1) {
            activeTab.appendChild(item);
        }
        else if (element["status"] === 2) {
            finishedTab.appendChild(item);
        }
        else if (element["status"] === 3) {
            errorTab.appendChild(item);
        }
        else if (element["status"] === 4) {
            errorTab.appendChild(item);
        }
    }
}
addUrlButton.addEventListener('click', function () {
    addDownload(addUrlText.value);
});
markUrlButton.addEventListener('click', function () {
    let markList = markUrlText.value.split(",");
    markDownload(markList);
});
function main() {
    window.setInterval(function () {
        return __awaiter(this, void 0, void 0, function* () {
            let data = getDownloads();
            if (data !== null) {
                let element = createDownloadItem(yield data);
                if (element !== null) {
                    // displayDownloads(element);
                }
            }
        });
    }, 1000);
}
main();
class DownloadManager {
    constructor(status) {
        this.status = status;
    }
    getStatus() {
        console.log(this.status);
    }
    setStatus(status) {
        this.status = status;
    }
}
let data = {
    "url": "https://deneme.mp4",
    "gid": "123abc4567def",
    "priority": 2,
    "status": 4,
    "added": "1111-22-33T44:55:66.778899",
    "download": null,
    "file": null,
    "path": null,
    "size": "250 MB",
    "using": false
};
DownloadManager.prototype.setStatus(data);
DownloadManager.prototype.getStatus();
//# sourceMappingURL=script.js.map