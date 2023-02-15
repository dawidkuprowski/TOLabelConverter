const labelsContainer = document.getElementById('labels');
let labels = [];

class Label {
    constructor (id, anc, bin, quantity) {
        this.id = id;
        this.anc = anc;
        this.bin = bin;
        this.quantity = quantity;

        this.init();
    }

    init () {
        labelsContainer.innerHTML += `
        <div class="label_container">
            <div class="row">
                <div class="col gap-2" id="qrANC_${this.id}">
                    <div>
                        <span>ANC</span>
                        <span>${this.anc}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col gap-2" id="qrBIN_${this.id}">
                    <div>
                        <span>BIN</span>
                        <span>${this.bin}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col gap-2" id="qrQUANTITY_${this.id}">
                    <div>
                        <span>QUANTITY</span>
                        <span>${this.quantity}</span>
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
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(file);
        fileReader.onload = (event) => {
            let data = event.target.result;
            let workbook = XLSX.read(data, { type:"binary" });
            workbook.SheetNames.forEach((sheet) => {
                let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                rowObject.forEach((element) => {
                    const id = labels.length;
                    new Label(id, element["ANC"], element["BIN"], element["QUANTITY"]);
                });
            });

            generateQRCodes();
        }
    }
});

function clearLabels () {
    labelsContainer.innerHTML = '';
}

function generateQRCodes () {
    for (label of labels) {
        var qrANC = new QRCode(document.getElementById("qrANC_" + label.id), {
            width: 128,
            height: 128,
            text: label.anc
        });
    
        var qrBIN = new QRCode(document.getElementById("qrBIN_" + label.id), {
            width: 128,
            height: 128,
            text: label.bin
        });
    
        var qrQUANT = new QRCode(document.getElementById("qrQUANTITY_" + label.id), {
            width: 128,
            height: 128,
            text: label.quantity
        });
    }

    readyToPrint();
}

function print () {
    const mywindow = window.open('', 'PRINT', 'height=1280,width=720');

    mywindow.document.write(`
        <html>
            <head>
                <title>OnFloor Label</title>
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

    clearLabels();
    labels = [];
    document.getElementById('input_file').value = '';
    document.getElementById('button_print').hidden = true;
}

function readyToPrint () {
    document.getElementById('button_print').hidden = false;
}