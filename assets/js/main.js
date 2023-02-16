const labelsContainer = document.getElementById('labels');
let labels = [];
const qrCodeSize = 128;

class Label {
    constructor (id, date, anc, qty, from_st, from_bin, to_st, to_bin, tr_order, tr_item) {
        this.id = id;
        this.date = date;
        this.anc = anc;
        this.qty = qty;
        this.from_st = from_st;
        this.from_bin = from_bin;
        this.to_st = to_st;
        this.to_bin = to_bin;
        this.tr_order = tr_order;
        this.tr_item = tr_item;

        this.init();
    }

    init () {
        labelsContainer.innerHTML += `
        <div class="label_container">
            <div class="row">
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-2 fw-5">${this.date}</span>
                    </div>
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-4 fw-5">ANC</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-7 fw-7">${this.anc}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col p1" id="qrANC_${this.id}">
                    
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col p1" id="qrQTY_${this.id}">
                    
                </div>
                <div class="border_col"></div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-4 fw-5">QTY</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-7 fw-7">${this.qty}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col">
                    <div class="col p0">
                        <span class="fs-4 fw-5">FROM</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-4 fw-7">${this.from_st}</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-4 fw-5">${this.from_bin}</span>
                    </div>
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col">
                    <div class="col p0">
                        <span class="fs-4 fw-5">TO</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-4 fw-7">${this.to_st}</span>
                    </div>
                </div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-11 fw-7">${this.to_bin}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col p1" id="qrTO_BIN_${this.id}">
                        
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col p1" id="qrTR_ORDER_ITEM_${this.id}">
                            
                </div>
                <div class="border_col"></div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-4 fw-5">TR.ORDER / ITEM</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7">${this.tr_order} / ${this.tr_item}</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        labels.push(this);
    }
}

document.getElementById('input_file').addEventListener("change", (event) => {
    const file = event.target.files[0];
    if(file){
        clearLabels();
        document.getElementById('input_file_label').innerText = "Converting...";
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(file);
        fileReader.onload = async (event) => {
            let data = event.target.result;
            let workbook = await XLSX.read(data, { type:"binary" });
            await workbook.SheetNames.forEach(async (sheet) => {
                let rowObject = await XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                console.log(rowObject);
                for (let i = 1; i < rowObject.length; i++) {
                    const id = labels.length;
                    let _date = rowObject[i]["__EMPTY"];
                    let _anc = rowObject[i]["__EMPTY_3"];
                    let _qty = rowObject[i]["__EMPTY_8"].toFixed(3);
                    let _from_st = rowObject[i]["__EMPTY_4"];
                    let _from_bin = rowObject[i]["__EMPTY_5"];
                    let _to_st = rowObject[i]["__EMPTY_6"];
                    let _to_bin = rowObject[i]["__EMPTY_7"].toString().padStart(8, '0').replace(/\d{2}(?!$)/g, "$&-");
                    let _tr_order = rowObject[i]["__EMPTY_1"].toString().padStart(10, '0');
                    let _tr_item = rowObject[i]["__EMPTY_2"].toString().padStart(4, '0');
                    if (_anc.length > 9) {
                        _anc = _anc.substr(_anc.length - 9);
                    }
                    new Label(id, _date, _anc, _qty, _from_st, _from_bin, _to_st, _to_bin, _tr_order, _tr_item);
                }
            });

            generateQRCodes();
        }
    }
});

function clearLabels () {
    labelsContainer.innerHTML = '';
}

async function generateQRCodes () {
    for await (label of labels) {
        var qrANC = await new QRCode(document.getElementById("qrANC_" + label.id), {
            width: 96,
            height: 96,
            text: label.anc
        });

        var qrQTY = await new QRCode(document.getElementById("qrQTY_" + label.id), {
            width: 96,
            height: 96,
            text: Number(label.qty).toFixed(0)
        });
        
        var qrTO_BIN = await new QRCode(document.getElementById("qrTO_BIN_" + label.id), {
            width: 96,
            height: 96,
            text: label.to_bin.replace(/\s/g,'')
        });

        var qrTR_ORDER_ITEM = await new QRCode(document.getElementById("qrTR_ORDER_ITEM_" + label.id), {
            width: 96,
            height: 96,
            text: label.tr_order + label.tr_item
        });
    }
    document.getElementById('input_file_label').innerText = "The document has been successfully converted.";
    readyToPrint();
}

function print () {
    const mywindow = window.open('', 'PRINT', 'height=1280,width=720');

    mywindow.document.write(`
        <html>
            <head>
                <title>Transfer Order Labels</title>
                <link rel="stylesheet" href="./assets/css/label.css">
            </head>
            <body>`);
    
    for (const child of labelsContainer.children) {
        mywindow.document.write(`<div class="label_container">`);
        mywindow.document.write(child.innerHTML);
        mywindow.document.write(`</div>`);
    }

    mywindow.document.write(`
            </body>
        </html>
    `);

    refreshApp();
}

function refreshApp () {
    clearLabels();
    labels = [];
    document.getElementById('input_file').value = '';
    document.getElementById('button_print').hidden = true;
    document.getElementById('input_file_label').innerText = "Click to select a document.";
}

function readyToPrint () {
    document.getElementById('button_print').hidden = false;
}