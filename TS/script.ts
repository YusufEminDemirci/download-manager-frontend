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

let gidList: string[]= [];
let activeList: Status[] = [];

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
class DownloadList{
    data: Status[];
    progress:string;
    download:Download|undefined;
    display:string;
    
    constructor(){
        this.data = [] as Status[];
        this.progress = "0";
        this.download;
        this.display = "none";
    }

    public getDownloads(){
        this.getList();
        this.updateActiveDownloadProgress();
    }

    private async getList() {
        let response:Response = await fetch(statusUrl);
        if (response.status === 200) {
            this.data = await response.json();
            this.createItem(this.data);
        }
    }

    private createItem(data:Status[]):void{
        this.data.forEach((element:Status) => {
            if (!gidList.includes(element.gid)) {
                item = document.createElement("div");
                item.classList.add("item");
                gidList.push(element.gid);
                item.setAttribute("id", element.gid);
                item.innerHTML = this.createItemData(element);
            }

            if (element.status === 0) {
                activeTab.appendChild(item);
            } else if (element.status === 1) {
                activeTab.appendChild(item);
            } else if (element.status === 2) {
                finishedTab.appendChild(item);
            } else if (element.status === 3) {
                errorTab.appendChild(item);
            } else if (element.status === 4) {
                errorTab.appendChild(item);
            }
        })
    }

    private createItemData(element:Status):string {

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
        `
        return obj
    }

    private calcProgress(element:Download):string {
        let totalLength = element.totalLength;
        let downloadedLength = element.completedLength;
        let progress = ((downloadedLength / totalLength) * 100).toFixed(2).toString();
        return progress;
    }

    private fileExtension(url:string):string {
        let fileExtension = url.split(".")[url.split(".").length - 1];
        if (fileExtension === "mkv" || fileExtension === "mp4") {
            return "video-logo.png";
        } else if (fileExtension === "jpg" || fileExtension === "png" || fileExtension === "jpeg" || fileExtension === "svg") {
            return "photo-logo.png";
        } else {
            return "";
        }
    }

    public updateActiveDownloadProgress():void {
        activeList.forEach(element => {
            let item = document.getElementById(`${element.gid}-progress`)
            if(element.download !== null && item !== null){
                let progress = this.calcProgress(element.download)
                item.innerText = `%${progress}`;
                item.style.width = `${progress}%`;
            }
        });
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
            location.reload();
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
            deviceIpLabel.innerText = `IP: ${this.deviceIp}`;
            deviceDiskCapacity.innerText = `T. CAPACITY: ${this.deviceStatus.disk.total_capacity}`;
            deviceDiskCached.innerText = `CACHED: ${this.deviceStatus.disk.cached}`;
            deviceDiskTimestamp.innerText = this.parseTimestamp(this.deviceStatus.timestamp);
    
        }else{
            alert(`An error occurred while getting device information!`);
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
}

async function main(){
    let deviceIp: IP = new DeviceIp();
    let deviceStatus:STATUS = new DeviceStatus();

    window.setInterval(async function() {
        new DownloadList().getDownloads();
        new DownloadList().updateActiveDownloadProgress();
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


