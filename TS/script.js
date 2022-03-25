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
let deviceIpLabel = document.getElementById("device-ip");
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
class DownloadList {
    constructor() {
        this.data = [];
        this.progress = "0";
        this.download;
        this.display = "none";
    }
    getDownloads() {
        this.getList();
        this.updateActiveDownloadProgress();
    }
    getList() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(statusUrl);
            if (response.status === 200) {
                this.data = yield response.json();
                this.createItem(this.data);
            }
        });
    }
    createItem(data) {
        this.data.forEach((element) => {
            if (!gidList.includes(element.gid)) {
                item = document.createElement("div");
                item.classList.add("item");
                gidList.push(element.gid);
                item.setAttribute("id", element.gid);
                item.innerHTML = this.createItemData(element);
            }
            if (element.status === 0) {
                activeTab.appendChild(item);
            }
            else if (element.status === 1) {
                activeTab.appendChild(item);
            }
            else if (element.status === 2) {
                finishedTab.appendChild(item);
            }
            else if (element.status === 3) {
                errorTab.appendChild(item);
            }
            else if (element.status === 4) {
                errorTab.appendChild(item);
            }
        });
    }
    createItemData(element) {
        let display = "none";
        let progress = "0";
        if (element.download !== null) {
            progress = this.calcProgress(element.download);
            if (progress !== "NaN") {
                display = "block";
            }
        }
        let src = this.fileExtension(element.url);
        let obj = `
        <img class="file-type" src="${src}" alt="type-img"></img>
        <div class='item-detail'>
            <label class="labelArea" style='padding-top:20px'>URL: ${element.url}</label>
            <label class="labelArea">GID: ${element.gid}</label>
            <label class="labelArea">PRIORITY: ${element.priority}</label>
            <label class="labelArea">STATUS: ${element.status}</label>
            <label class="labelArea">ADDED: ${element.added}</label>
            <label class="labelArea">DOWNLOAD: ${element.download}</label>
            <label class="labelArea">FILE: ${element.file}</label>
            <label class="labelArea">PATH: ${element.path}</label>
            <label class="labelArea">SIZE: ${element.size}</label>
            <label class="labelArea" style='padding-bottom:20px'>USING: ${element.using}</label>
        </div>
            <div class="progress-container" style="display:${display}">
            <div class="progress" id="${element.gid}-progress" style="width:${progress}%">%${progress}</div>
        </div>
        `;
        return obj;
    }
    calcProgress(element) {
        let totalLength = element.totalLength;
        let downloadedLength = element.completedLength;
        let progress = ((downloadedLength / totalLength) * 100).toFixed(2).toString();
        return progress;
    }
    fileExtension(url) {
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
    updateActiveDownloadProgress() {
        activeList.forEach(element => {
            let item = document.getElementById(`${element.gid}-progress`);
            if (element.download !== null && item !== null) {
                let progress = this.calcProgress(element.download);
                item.innerText = `%${progress}`;
                item.style.width = `${progress}%`;
            }
        });
    }
}
class AddDownload {
    constructor(url) {
        this.url = url;
        this.data = { url: `${this.url}` };
    }
    addDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(addDownloadUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(this.data),
            });
            if (response.status === 200) {
                alert(`"${this.url}" added to download list!`);
                location.reload();
            }
            else {
                alert(`An error occurred while adding the "${this.url}" to the download list!`);
            }
        });
    }
}
class MarkDownload {
    constructor(urls) {
        this.urls = urls;
        this.data = { urls: this.urls };
    }
    markDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(markUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(this.data),
            });
            if (response.status === 200) {
                alert(`"${this.urls.length}" url marked!`);
                location.reload();
            }
            else {
                alert(`An error occurred while marking the "${this.urls.length}" url!`);
            }
        });
    }
}
class DeviceIp {
    constructor() {
        this.deviceIP = mainUrl;
    }
    getDeviceIp() {
        return this.deviceIP;
    }
}
class DeviceStatus {
    constructor() {
        this.deviceStatus = {};
    }
    getDeviceStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(deviceInfoUrl);
            if (response.status === 200) {
                this.deviceStatus = yield response.json();
                return this.deviceStatus;
            }
            else {
                return null;
            }
        });
    }
}
class DeviceInfo {
    constructor(deviceIp, deviceStatus) {
        this.deviceIp = deviceIp;
        this.deviceStatus = deviceStatus;
    }
    getDeviceInfo() {
        if ((this.deviceIp !== null && this.deviceIp !== undefined) && (this.deviceStatus !== null && this.deviceStatus !== undefined)) {
            deviceIpLabel.innerText = `IP: ${this.deviceIp}`;
            deviceDiskCapacity.innerText = `T. CAPACITY: ${this.deviceStatus.disk.total_capacity}`;
            deviceDiskCached.innerText = `CACHED: ${this.deviceStatus.disk.cached}`;
            deviceDiskTimestamp.innerText = this.parseTimestamp(this.deviceStatus.timestamp);
        }
        else {
            alert(`An error occurred while getting device information!`);
        }
    }
    parseTimestamp(timestamp) {
        if (timestamp !== null) {
            let year = timestamp.split("T")[0].split("-");
            let date = `${year[0]}/${year[1]}/${year[2]}`;
            let hour = timestamp.split("T")[1].split(".")[0];
            timestamp = date + " - " + hour;
            return `${timestamp}`;
        }
        else {
            console.error("An error occurred while parsing timestamp!");
            return timestamp;
        }
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let deviceIp = new DeviceIp();
        let deviceStatus = new DeviceStatus();
        window.setInterval(function () {
            return __awaiter(this, void 0, void 0, function* () {
                new DownloadList().getDownloads();
                new DownloadList().updateActiveDownloadProgress();
                new DeviceInfo(deviceIp.getDeviceIp(), yield deviceStatus.getDeviceStatus()).getDeviceInfo();
            });
        }, 1000);
    });
}
main();
addUrlButton.addEventListener('click', function () {
    let add = new AddDownload(addUrlText.value);
    add.addDownload();
});
markUrlButton.addEventListener('click', function () {
    let markList = markUrlText.value.split(",");
    let mark = new MarkDownload(markList);
    mark.markDownload();
});
//# sourceMappingURL=script.js.map