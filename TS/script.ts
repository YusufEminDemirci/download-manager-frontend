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
interface DeviceInfo {
    name:        string;
    description: string;
    disk:        Disk;
    timestamp:   string;
}
interface Disk {
    total_capacity: string;
    cached:         string;
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

let gidList: any[]= [];
let activeList: any[] = [];

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
class Downloads{
    private data:Array<Status>;
    private element:Status;

    constructor(){
        this.data = [];
        this.element = {} as Status;
    }
    
    private async getDownloads():Promise<Array<Status> | null> {
        let response:Response = await fetch(statusUrl);
        if (response.status === 200) {
            this.data = await response.json();
            return this.data;
        }
        else{
            return null;
        }
    }

    private createDownloadItem():Status | null{
        if(this.data !== null){
            this.data.forEach((element:Status) => {
                if (!gidList.includes(element.gid)) {
                    item = document.createElement("div");
                    item.classList.add("item");
                    gidList.push(element.gid);
                    item.setAttribute("id", element.gid);
                    this.element = element;
                    return this.element;
                }
                else{
                    return null;
                }
            })
        }
        return null;
    }
    
    private createData(element:Status):string|null {

        if(element !== null){
            let download = this.element.download;
            let display = "none";
            let progress = "0";
        
            if (download !== null) {
                progress = String(this.calcDownloadProgress(element));
                if (progress !== "NaN") {
                    display = "block";
                }
            }
        
            let src:string|null = this.getDataExtension(element.url);
        
            let obj:string = `<img class="file-type" src="${src}" alt="type-img"></img><div class='item-detail'>
            <label class="labelArea" style='padding-top:20px'>URL: ${element.url}</label>
            <label class="labelArea">GID: ${element.gid}</label>
            <label class="labelArea">PRIORITY: ${element.priority}</label>
            <label class="labelArea">STATUS: ${element.status}</label>
            <label class="labelArea">ADDED: ${element.added}</label>
            <label class="labelArea">DOWNLOAD: ${download}</label>
            <label class="labelArea">FILE: ${element.file}</label>
            <label class="labelArea">PATH: ${element.path}</label>
            <label class="labelArea">SIZE: ${element.size}</label>
            <label class="labelArea" style='padding-bottom:20px'>USING: ${element.using}</label></div>
            <div class="progress-container" style="display:${display}"><div class="progress" id="${element.gid}-progress" style="width:${progress}%">%${progress}</div></div>
            `
        
            return obj
        }
        else{
            return null;
        }
    }

    private calcDownloadProgress(data:Status|null):string|null {
        if(data!==null && data.download !== null){
            let totalLength:number = data.download.totalLength;
            let downloadedLength:number = data.download.completedLength;
            if(totalLength !== null && downloadedLength !== null) {
                let progress = (downloadedLength / totalLength) * 100;
                let progressText = progress.toFixed(2);
                return progressText;
            }
            else{
                
            return null;
            }
        }
        else{
            
        return null;
        }
    }

    private getDataExtension(url:string):string|null {
        let fileExtension:string = url.split(".")[url.split(".").length - 1];
        let logo:string;
        if (fileExtension === "mkv" || fileExtension === "mp4") {
            logo = "video-logo.png";
            return logo;
        } else if (fileExtension === "jpg" || fileExtension === "png" || fileExtension === "jpeg" || fileExtension === "svg") {
            logo = "photo-logo.png";
            return logo;
        } else {
            return null;
        }
    } 
    
    private displayItem(){
        if(this.element !== null){
            let createdItem:string|null = this.createData(this.element);

            if(createdItem !== null){
                item.innerHTML = createdItem;if (this.element.status === 0) {
                    activeTab.appendChild(item);
                } else if (this.element.status === 1) {
                    activeTab.appendChild(item);
                } else if (this.element.status === 2) {
                    finishedTab.appendChild(item);
                } else if (this.element.status === 3) {
                    errorTab.appendChild(item);
                } else if (this.element.status === 4) {
                    errorTab.appendChild(item);
                }
            }
        }
    }

    public updateActiveDownloadProgress() {
        activeList.forEach(element => {
            let item = document.getElementById(`${element.gid}-progress`)
            let progress = this.calcDownloadProgress(element.download)
            if(item!== null) {
                item.innerText = `%${progress}`;
                item.style.width = `${progress}%`;
            }
        });
    }

    public async addDownload(url:string):Promise<void> {
        let data: {url: string;} = { url: `${url}` };
    
        let response:Response = await fetch(addDownloadUrl, {
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

    public async markDownload(urls:string | Array<string>):Promise<void>  {
        let data: {urls: string | string[];} = { urls: urls };
    
        let response:Response = await fetch(markUrl, {
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

    public getDownloadItems(){
        let downloadItems: Promise<Status[] | null> = this.getDownloads();
        if(downloadItems !== null) {
            let createdItem: Status | null = this.createDownloadItem();
    
            if(createdItem !== null) {
                let createdData: string | null = this.createData(createdItem);

                if(createdData !== null)
                {
                    this.getDataExtension(createdItem.url);
                    this.displayItem();
                }
            }
        }
    }
}
class DeviceInfo{
    private deviceIp:string = "";
    private total_capacity:string = "";
    private cached:string = "";
    private time:string = "";
    
    private getDeviceIp():string | null {
        let deviceIp:string = mainUrl.split("//")[1]
        if(deviceIp !== null){
            this.deviceIp = deviceIp;
            return this.deviceIp;
        }
        else{
            return null;
        }
    }

    private async getDeviceStatus():Promise<DeviceInfo | null> {
        let response:Response = await fetch(deviceInfoUrl);
        if (response.status === 200) {
            let data:DeviceInfo = await response.json();
            this.total_capacity = data.disk.total_capacity;   
            this.cached = data.disk.cached;
            return data;
        } else {
            return null;
        }
    }

    private parseTimestamp(data:DeviceInfo|null):string|null{
        if(data !== null){
            let year:string[] = data.timestamp.split("T")[0].split("-");
            let date:string = `${year[0]}/${year[1]}/${year[2]}`;
            let hour:string = data.timestamp.split("T")[1].split(".")[0];
            let timestamp:string = date + " - " + hour;
            this.time = timestamp;
            return this.time;
        }
        else{
            return null;
        }
    }

    public async getDeviceInfo(){
        let deviceIp = this.getDeviceIp();
        let deviceStatus = this.getDeviceStatus();

        if(deviceIp !== null)
        {
            deviceIpLabel.innerText = `IP: ${deviceIp}`;
        }
        if(deviceStatus !== null)
        {
            deviceDiskCapacity.innerText = `T. CAPACITY: ${this.total_capacity}`;
            deviceDiskCached.innerText = `CACHED: ${this.cached}`;

            let time = this.parseTimestamp(await deviceStatus);

            if(time !== null){
                deviceDiskTimestamp.innerText = `${this.timestamp}`;
            }
        }
        alert(`An error occurred while getting device information!`);
    }
}

function main(){
    window.setInterval(async function() {
        Downloads.prototype.getDownloadItems();
        DeviceInfo.prototype.getDeviceInfo();
        Downloads.prototype.updateActiveDownloadProgress();
    }, 1000);
}

main();

addUrlButton.addEventListener('click', function() {
    Downloads.prototype.addDownload(addUrlText.value);
})

markUrlButton.addEventListener('click', function() {
    let markList = markUrlText.value.split(",");
    Downloads.prototype.markDownload(markList);
})