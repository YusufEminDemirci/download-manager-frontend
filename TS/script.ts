"use strict";
interface Status {
    url:      string;
    gid:      string;
    priority: number;
    status:   number;
    added:    string;
    download: Download | null;
    file:     string | null;
    path:     string | null;
    size:     string | null;
    using:    boolean;
}
interface Download {
    bitfield:        string | null;
    completedLength: number;
    connections:     number;
    dir:             string;
    downloadSpeed:   number;
    errorCode:       number | null;
    errorMessage:    string | null;
    files:           File[];
    gid:             string;
    numPieces:       number;
    pieceLength:     number;
    status:          string;
    totalLength:     number;
    uploadLength:    number;
    uploadSpeed:     number;
}
interface File {
    index:           number;
    completedLength: number;
    length:          number;
    path:            string;
    selected:        string;
    uris:            Uris[];
}
interface Uris {
    status: string;
    uri:    string;
}
interface DeviceInformation {
    name:        string;
    description: string;
    disk:        Disk;
    timestamp:   string;
}
interface Disk {
    total_capacity: string;
    cached:         string;
}

interface IP{
    getDeviceIp(): string;
}
interface STATUS{
    getDeviceStatus(): Promise<DeviceInformation | null>;
}

enum StatusCode {
    Waiting = 0,
    Downloading = 1,
    Completed = 2,
    Paused = 3,
    Error = 4,
}

let addUrlButton = <HTMLInputElement>document.getElementById("add-button");
let addUrlText = <HTMLInputElement>document.getElementById("add-url-text");

let markUrlButton = <HTMLInputElement>document.getElementById("mark-button");
let markUrlText = <HTMLInputElement>document.getElementById("mark-url-text");

let deviceIpLabel = <HTMLInputElement>document.getElementById("device-ip")
let deviceDiskCapacity = <HTMLInputElement>document.getElementById("device-disk-capacity")
let deviceDiskCached = <HTMLInputElement>document.getElementById("device-disk-cached")
let deviceDiskTimestamp = <HTMLInputElement>document.getElementById("device-disk-timestamp")

let errorTab = <HTMLInputElement>document.getElementById("error");
let activeTab = <HTMLInputElement>document.getElementById("active");
let finishedTab = <HTMLInputElement>document.getElementById("finished");
let item: HTMLDivElement;


const mainUrl = "http://127.0.0.1:6802";
const deviceInfoUrl = new URL(`${mainUrl}/`).toString();
const statusUrl = new URL(`${mainUrl}/download/status`).toString();
const activeUrl = new URL(`${mainUrl}/download/status/active`).toString();
const addDownloadUrl = new URL(`${mainUrl}/download/add`).toString();
const markUrl = new URL(`${mainUrl}/download/mark`).toString();

let gidList:string[] = [];

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};
class DownloadList{
    data: Status[];
    progress:string;
    download:Download|undefined;
    display:string;
    activeList: Status[];
    
    constructor(){
        this.data = [] as Status[];
        this.progress = "0";
        this.download;
        this.display = "none";
        this.activeList = [] as Status[];
    }

    public getDownloads(){
        this.getList();
        this.getActiveList();
        this.updateActiveDownloadProgress(this.activeList);
    }

    private async getList() {
        let response:Response = await fetch(statusUrl);
        if (response.status === 200) {
            this.data = await response.json();
            this.createItem();
        }
    }

    private async getActiveList() {
        let response:Response = await fetch(activeUrl);
        if (response.status === 200) {
            this.data = await response.json();
            this.data.forEach((element:Status) => {
                this.activeList.push(element);
                this.updateActiveDownloadProgress(this.activeList);
            })
        }
    }

    private createItem():void{
        this.data.forEach((element:Status) => {
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
            }else if (element.status === StatusCode.Downloading) {
                activeTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient( to right, rgba(173,252,234,1), rgba(192,229,246,1)  )";
            }else if (element.status === StatusCode.Completed) {
                finishedTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient(to right, #d4fc79, #64F877 )";
            } else if (element.status === StatusCode.Paused || element.status === StatusCode.Error) {
                errorTab.appendChild(item);
                item.style.backgroundImage = "linear-gradient(25deg,#d64c7f,#ee4758 50%)";
            }
        })
    }

    private createItemData(element:Status):string {
        let imgLabel = this.createLabel("img",element);
        let urlLabel = this.createLabel("url",element);
        let gidLabel = this.createLabel("gid",element);
        let priorityLabel = this.createLabel("priority",element);
        let statusLabel = this.createLabel("status",element);
        let addedLabel = this.createLabel("added",element);
        let downloadLabel = this.createLabel("download",element);
        let fileLabel = this.createLabel("file",element);
        let pathLabel = this.createLabel("path",element);
        let sizeLabel = this.createLabel("size",element);
        let usingLabel = this.createLabel("using", element);
        let topPaddingLabel = this.createLabel("topPaddingLabel", element);
        let bottomPaddingLabel = this.createLabel("bottomPaddingLabel", element);
        let progressLabel = this.createLabel("progressBar",element);

        let chart_detail = `${imgLabel}${topPaddingLabel}${urlLabel}`;

        switch (element.status) {
            case StatusCode.Completed:
                return chart_detail += `${fileLabel}${sizeLabel}${addedLabel}${gidLabel}${priorityLabel}${usingLabel}${pathLabel}${bottomPaddingLabel}</div>`;
            case StatusCode.Downloading:
            case StatusCode.Waiting:
            case StatusCode.Paused:
                return chart_detail += `${addedLabel}${gidLabel}${priorityLabel}${statusLabel}${bottomPaddingLabel}</div>${progressLabel}`;
            case StatusCode.Error:
                return chart_detail += `${addedLabel}${gidLabel}${priorityLabel}${bottomPaddingLabel}</div>`;
        }
        return chart_detail;
    }

    private createLabel(type: string, element: Status) {
        switch (type) {
            case "img":
                element.url = this.parseExtension(element.url);
                return `<img class="file-type" src="${element.url}" alt="type-img"></img>
                        <div class='item-detail'>`;
            case "url":
                return `<label class="labelArea">URL: ${element.url}</label>`;
            case "gid":
                return `<label class="labelArea">GID: ${element.gid}</label>`;
            case "priority":
                return `<label class="labelArea">PRIORITY: ${element.priority}</label>`;
            case "status":
                let statusText:string = this.parseStatus(element.status);
                return `<label class="labelArea">STATUS: ${statusText}</label>`;
            case "added":
                    element.added = this.parseTimestamp(element.added);
                return `<label class="labelArea">ADDED: ${element.added}</label>`;
            case "download":
                return `<label class="labelArea">DOWNLOAD: ${element.download}</label>`;
            case "file":
                element.file = this.parseFileName(element.file);
                return `<label class="labelArea">FILE: ${element.file}</label>`;
            case "path":
                element.path = this.parseFilePath(element.path);
                return `<label class="labelArea">PATH: ${element.path}</label>`;
            case "size":
                element.size = this.parseSize(element.size);
                return `<label class="labelArea">SIZE: ${element.size}</label>`;
            case "using":
                return `<label class="labelArea">USING: ${element.using}</label>`;
            case "topPaddingLabel":
                return `<label class="labelArea" style='padding-top:20px'></label>`;
            case "bottomPaddingLabel":
                return `<label class="labelArea" style='padding-bottom:20px'></label>`;
            case "progressBar":let progress = "0";
                if (element.download !== null) {
                    progress = this.calcProgress(element.download);
                }
                return `<div class="progress-container" style="display:block">
                            <div class="progress" id="${element.gid}-progress" style="width:${progress}%">%${progress}</div>
                        </div>`;
        }
    }

    private calcProgress(element:Download|null):string {
        if(element !== null) {{
            let totalLength = element.totalLength;
            let downloadedLength = element.completedLength;
            let progress = ((downloadedLength / totalLength) * 100).toFixed(2).toString();
            return progress;
        }}
        return "NaN";
    }

    private parseFileName(fName:string|null):string{

        if(fName !== null)
        {
            let fileName = fName.split(".");
            return fileName[0];
        }
        return "Nan";
    }

    private parseFilePath(fPath:string|null):string{

        if(fPath !== null)
        {
            let filePath = fPath.split("/duyurubu_client");

            return ".../duyurubu_client" + filePath[1];
        }
        return "Nan";
    }

    private parseSize(fSize:string|null):string{

        if(fSize !== null)
        {
            let kbSize:Number = Number((Number(fSize)/1024).toFixed(3));
            let mbSize:Number = Number((Number(kbSize)/1024).toFixed(3));

            if(mbSize >= 1024){
                let gbSize = (Number(mbSize)/1024).toFixed(3);
                return gbSize  + " GB";
            }
            else if(kbSize >= 1024){
                let mbSize = (Number(kbSize)/1024).toFixed(3);
                return mbSize  + " MB";
            }
            else{
                return kbSize + " KB";
            }
        }
        return "Nan";
    }
    
    private parseTimestamp(fTimestamp:string):string{
        if(fTimestamp !== null){
            let year:string[] = fTimestamp.split("T")[0].split("-");
            let date: string = `${year[0]}/${year[1]}/${year[2]}`;
            let hour:string = fTimestamp.split("T")[1];
            fTimestamp = `${date} - ${hour}`;
            return `${fTimestamp}`;
        }
        else{
            return "Nan";
        }
    }

    private parseExtension(url:string):string {
        let fileExtension = url.split(".")[url.split(".").length - 1];
        if (fileExtension === "mkv" || fileExtension === "mp4") {
            return "video-logo.png";
        } else if (fileExtension === "jpg" || fileExtension === "png" || fileExtension === "jpeg" || fileExtension === "svg") {
            return "photo-logo.png";
        } else {
            return "";
        }
    }

    private parseStatus(status:Number):string{
        switch(status){
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

    private updateActiveDownloadProgress(activeList:Status[]):void {
        if(activeList !== null || activeList !== undefined) {{
            activeList.forEach(element => {
                let item = document.getElementById(`${element.gid}-progress`)
                if(item !== null){
                    let progress = this.calcProgress(element.download)
                    item.innerText = `%${progress}`;
                    item.style.width = `${progress}%`;
                }
            });
        }}
    }
}
class AddDownload{
    url:string;
    data:{url: string;};

    constructor(url:string){
        this.url = url;
        this.data = { url: `${this.url}` };
    }

    public async addDownload():Promise<void> {

        let response:Response = await fetch(addDownloadUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(this.data),
        });
        if (response.status === 200) {
            alert(`"${this.url}" added to download list!`);
        } else {
            alert(`An error occurred while adding the "${this.url}" to the download list!`);
        }
    }
}
class MarkDownload{
    urls:string | string[];
    data:{urls: string | string[];};

    constructor(urls:string | string[]){
        this.urls = urls;
        this.data = { urls: this.urls };
    }

    public async markDownload():Promise<void>  {
    
        let response:Response = await fetch(markUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(this.data),
        });
        if (response.status === 200) {
            alert(`"${this.urls.length}" url marked!`);
            location.reload();
        } else {
            alert(`An error occurred while marking the "${this.urls.length}" url!`);
        }
    }
}
class DeviceIp implements IP{
    private deviceIP:string;

    constructor(){
        this.deviceIP = mainUrl;
    }

    public getDeviceIp():string {
        return this.deviceIP;
    }
}
class DeviceStatus implements STATUS{
    private deviceStatus:DeviceInformation;

    constructor(){
        this.deviceStatus = {} as DeviceInformation;
    }
    public async getDeviceStatus():Promise<DeviceInformation | null> {
        let response:Response = await fetch(deviceInfoUrl);
        if (response.status === 200) {
            this.deviceStatus = await response.json();
            return this.deviceStatus
        }
        else{
            return null;
        }
    }
}
class DeviceInfo{
    private deviceIp: string;
    private deviceStatus: DeviceInformation|null;

    constructor(deviceIp:string, deviceStatus:DeviceInformation|null) {
        this.deviceIp = deviceIp;
        this.deviceStatus = deviceStatus;
    }

    public getDeviceInfo(){
        if((this.deviceIp !== null && this.deviceIp !== undefined) && (this.deviceStatus !== null && this.deviceStatus !== undefined)){
            deviceIpLabel.innerText = `Device Ip: ${this.deviceIp}`;
            deviceDiskCapacity.innerText = `Total Capacity: ${this.deviceStatus.disk.total_capacity}`;
            deviceDiskCached.innerText = `Cached: ${this.parseSize(this.deviceStatus.disk.cached)}`;
            deviceDiskTimestamp.innerText = this.parseTimestamp(this.deviceStatus.timestamp);
    
        }else{
            console.error(`An error occurred while getting device information!`);
        }
    }

    public parseTimestamp(timestamp:string):string{
        if(timestamp !== null){
            let year:string[] = timestamp.split("T")[0].split("-");
            let date:string = `${year[0]}/${year[1]}/${year[2]}`;
            let hour:string = timestamp.split("T")[1].split(".")[0];
            timestamp = date + " - " + hour;
            return `${timestamp}`;
        }
        else{
            console.error("An error occurred while parsing timestamp!");
            return timestamp;
        }
    }

    private parseSize(fSize: string | null): string{
        let tbSize = 1048576;
        let gbSize = 1024;
        if(fSize !== null){
            let size = Number(fSize.split(" ")[0]);

            if(size >= tbSize){
                return (Number((Number(size)/1024).toFixed(3))/1024).toFixed(3) + " TB";
            }
            else if(size >= gbSize){
                return (Number(size)/1024).toFixed(3) + " GB";
            }
            else{
                return Number(size) + " MB";
            }
        }
        return "Nan";
    }
}

async function main(){
    let deviceIp: IP = new DeviceIp();
    let deviceStatus:STATUS = new DeviceStatus();

    window.setInterval(async function() {
        new DownloadList().getDownloads();
        new DeviceInfo(deviceIp.getDeviceIp(),await deviceStatus.getDeviceStatus()).getDeviceInfo();
    }, 1000);
}

main();

addUrlButton.addEventListener('click', function() {
    let add  = new AddDownload(addUrlText.value);
    add.addDownload();
})

markUrlButton.addEventListener('click', function() {
    let markList = markUrlText.value.split(",");
    let mark = new MarkDownload(markList);
    mark.markDownload();
})