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
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["Waiting"] = 0] = "Waiting";
    StatusCode[StatusCode["Downloading"] = 1] = "Downloading";
    StatusCode[StatusCode["Completed"] = 2] = "Completed";
    StatusCode[StatusCode["Paused"] = 3] = "Paused";
    StatusCode[StatusCode["Error"] = 4] = "Error";
})(StatusCode || (StatusCode = {}));
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
const mainUrl = "http://127.0.0.1:6802";
const deviceInfoUrl = new URL(`${mainUrl}/`).toString();
const statusUrl = new URL(`${mainUrl}/download/status`).toString();
const activeUrl = new URL(`${mainUrl}/download/status/active`).toString();
const addDownloadUrl = new URL(`${mainUrl}/download/add`).toString();
const markUrl = new URL(`${mainUrl}/download/mark`).toString();
let gidList = [];
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
        this.activeList = [];
    }
    getDownloads() {
        this.getList();
        this.getActiveList();
        this.updateActiveDownloadProgress(this.activeList);
    }
    getList() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(statusUrl);
            if (response.status === 200) {
                this.data = yield response.json();
                this.createItem();
            }
        });
    }
    getActiveList() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(activeUrl);
            if (response.status === 200) {
                this.data = yield response.json();
                this.data.forEach((element) => {
                    this.activeList.push(element);
                    this.updateActiveDownloadProgress(this.activeList);
                });
            }
        });
    }
    createItem() {
        this.data.forEach((element) => {
            if (!gidList.includes(element.gid)) {
                item = document.createElement("div");
                item.classList.add("item");
                gidList.push(element.gid);
                item.setAttribute("id", element.gid);
                item.innerHTML = this.createItemData(element);
            }
            if (element.status === StatusCode.Waiting) {
                activeTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient(to right, #FF8E99, rgba(173,252,234,1))";
            }
            else if (element.status === StatusCode.Downloading) {
                activeTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient( to right, rgba(173,252,234,1), rgba(192,229,246,1)  )";
            }
            else if (element.status === StatusCode.Completed) {
                finishedTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient(to right, #d4fc79, #64F877 )";
            }
            else if (element.status === StatusCode.Paused || element.status === StatusCode.Error) {
                errorTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient(25deg,#d64c7f,#ee4758 50%)";
            }
        });
    }
    createItemData(element) {
        element.added = this.parseTimestamp(element.added);
        element.file = this.parseFileName(element.file);
        element.path = this.parseFilePath(element.path);
        element.size = this.parseSize(element.size);
        let statusText = this.parseStatus(element.status);
        let urlLabel = `<label class="labelArea">URL: ${element.url}</label>`;
        let gidLabel = `<label class="labelArea">GID: ${element.gid}</label>`;
        let priorityLabel = `<label class="labelArea">PRIORITY: ${element.priority}</label>`;
        let statusLabel = `<label class="labelArea">STATUS: ${statusText}</label>`;
        let addedLabel = `<label class="labelArea">ADDED: ${element.added}</label>`;
        let downloadLabel = `<label class="labelArea">DOWNLOAD: ${element.download}</label>`;
        let fileLabel = `<label class="labelArea">FILE: ${element.file}</label>`;
        let pathLabel = `<label class="labelArea">PATH: ${element.path}</label>`;
        let sizeLabel = `<label class="labelArea">SIZE: ${element.size}</label>`;
        let usingLabel = `<label class="labelArea">USING: ${element.using}</label>`;
        let topPaddingLabel = `<label class="labelArea" style='padding-top:20px'></label>`;
        let bottomPaddingLabel = `<label class="labelArea" style='padding-bottom:20px'></label>`;
        let chart_detail = "";
        let display = "none";
        let progress = "0";
        if (element.download !== null) {
            progress = this.calcProgress(element.download);
            if (progress !== "NaN") {
                display = "block";
            }
        }
        element.url = this.parseExtension(element.url);
        if (element.status === 2) {
            chart_detail = `
            <img class="file-type" src="${element.url}" alt="type-img"></img>
            <div class='item-detail'>
                ${topPaddingLabel}${urlLabel}${fileLabel}${sizeLabel}${addedLabel}${gidLabel}${priorityLabel}${statusLabel}${usingLabel}${pathLabel}${bottomPaddingLabel}
            </div>
            <div class="progress-container" style="display:${display}">
                <div class="progress" id="${element.gid}-progress" style="width:${progress}%">%${progress}</div>
            </div>
            `;
        }
        else if (element.status !== 2) {
            chart_detail = `
            <img class="file-type" src="${element.url}" alt="type-img"></img>
            <div class='item-detail'>
                ${topPaddingLabel}${urlLabel}${addedLabel}${gidLabel}${priorityLabel}${statusLabel}${bottomPaddingLabel}
            </div>
            <div class="progress-container" style="display:${display}">
                <div class="progress" id="${element.gid}-progress" style="width:${progress}%">%${progress}</div>
            </div>
            `;
        }
        return chart_detail;
    }
    calcProgress(element) {
        if (element !== null) {
            {
                let totalLength = element.totalLength;
                let downloadedLength = element.completedLength;
                let progress = ((downloadedLength / totalLength) * 100).toFixed(2).toString();
                return progress;
            }
        }
        return "NaN";
    }
    parseFileName(fName) {
        if (fName !== null) {
            let fileName = fName.split(".");
            return fileName[0];
        }
        return "Nan";
    }
    parseFilePath(fPath) {
        if (fPath !== null) {
            let filePath = fPath.split("/duyurubu_client");
            return ".../duyurubu_client" + filePath[1];
        }
        return "Nan";
    }
    parseSize(fSize) {
        if (fSize !== null) {
            let kbSize = Number((Number(fSize) / 1024).toFixed(3));
            let mbSize = Number((Number(kbSize) / 1024).toFixed(3));
            if (mbSize >= 1024) {
                let gbSize = (Number(mbSize) / 1024).toFixed(3);
                return gbSize + " GB";
            }
            else if (kbSize >= 1024) {
                let mbSize = (Number(kbSize) / 1024).toFixed(3);
                return mbSize + " MB";
            }
            else {
                return kbSize + " KB";
            }
        }
        return "Nan";
    }
    parseTimestamp(fTimestamp) {
        if (fTimestamp !== null) {
            let year = fTimestamp.split("T")[0].split("-");
            let date = `${year[0]}/${year[1]}/${year[2]}`;
            let hour = fTimestamp.split("T")[1].split(".")[0];
            fTimestamp = date + " - " + hour;
            return `${fTimestamp}`;
        }
        else {
            return "Nan";
        }
    }
    parseExtension(url) {
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
    parseStatus(status) {
        switch (status) {
            case StatusCode.Waiting:
                return "WAITING FOR DOWNLOAD...";
            case StatusCode.Downloading:
                return "DOWNLOADING...";
            case StatusCode.Completed:
                return "COMPLETED";
            case StatusCode.Paused:
                return "PAUSED";
            case StatusCode.Error:
                return "ERROR !";
            default:
                return "NaN";
        }
    }
    updateActiveDownloadProgress(activeList) {
        if (activeList !== null || activeList !== undefined) {
            {
                activeList.forEach(element => {
                    let item = document.getElementById(`${element.gid}-progress`);
                    if (item !== null) {
                        let progress = this.calcProgress(element.download);
                        item.innerText = `%${progress}`;
                        item.style.width = `${progress}%`;
                    }
                });
            }
        }
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
            deviceIpLabel.innerText = `Device Ip: ${this.deviceIp}`;
            deviceDiskCapacity.innerText = `Total Capacity: ${this.deviceStatus.disk.total_capacity}`;
            deviceDiskCached.innerText = `Cached: ${this.parseSize(this.deviceStatus.disk.cached)}`;
            deviceDiskTimestamp.innerText = this.parseTimestamp(this.deviceStatus.timestamp);
        }
        else {
            console.error(`An error occurred while getting device information!`);
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
    parseSize(fSize) {
        if (fSize !== null) {
            fSize = fSize.split(".")[0];
            let mbSize = Number((Number(fSize) / 1024).toFixed(3));
            if (mbSize >= 1024) {
                let gbSize = (Number(mbSize) / 1024).toFixed(3);
                return gbSize + " TB";
            }
            else {
                return mbSize + " GB";
            }
        }
        return "Nan";
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let deviceIp = new DeviceIp();
        let deviceStatus = new DeviceStatus();
        window.setInterval(function () {
            return __awaiter(this, void 0, void 0, function* () {
                new DownloadList().getDownloads();
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