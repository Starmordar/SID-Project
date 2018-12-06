const TWO_COLUMN_HEADER_CONTENT = ["Name", "Price"];
const THREE_COLUMN_HEADER_CONTENT = ["Name", "Price", "Quantity"];
const FOUR_COLUMN_HEADER_CONTENT = ["Id", "Name", "Price", "Quantity"];
const RED_COLOR = "rgb(255, 0, 0)";

const $btnsToCreateATable = $(".create-tbl button");
const $reloadPageBtn = $(".reload");
const $addNewProductForm = $(".addProdForm");
const $buyProdBtn = $(".buy-product")

let bunchOfProducts = [];
let currentNumerOfTableColumns;

class Product {
    constructor(id, name, price, quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}

$addNewProductForm.submit(function (event) {
    var product = $(this).serializeArray().reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    $(this).trigger("reset");

    createNewProduct(product);
    bunchOfProducts.push(product);
    addNewProductInTable(product, currentNumerOfTableColumns);

    return false;
});

$btnsToCreateATable.click(function () {
    hideTblCreationBtns($(this), $btnsToCreateATable);

    let propertiesOfProducts = getProductsFromServer();
    createProductList(propertiesOfProducts);

    let numberOfTblColumns = $(this).data("colm");
    currentNumerOfTableColumns = numberOfTblColumns
    removeElementFromRage($("table"));
    createTableAndAddContent(bunchOfProducts, numberOfTblColumns);

    $(".container").css("display", "block");

    addTableSortEvent($("table"), numberOfTblColumns);

    addHighlightingOnTable();
    observeTableMutation();
});

$reloadPageBtn.click(function () {
    location.reload();
});

$buyProdBtn.click(function () {
    let nameSelectedProduct = catchProductFromTable();
    let idSelectesProduct;
    if (nameSelectedProduct == undefined) {
        alert("Product not choosen, bitch");
        return;
    }

    for (let i = 0; i < bunchOfProducts.length; i++) {
        if (bunchOfProducts[i].name == nameSelectedProduct) {
            idSelectesProduct = bunchOfProducts[i].id;
        }
    }
    localStorage.setItem("product", nameSelectedProduct);
    window.location.replace(`/product/${idSelectesProduct}`);
});

if (window.location.href == 'http://localhost:3000/' && localStorage.getItem("product")) {
    let propertiesOfProducts = getProductsFromServer();
    createProductList(propertiesOfProducts);

    currentNumerOfTableColumns = 4;
    removeElementFromRage($("table"));
    createTableAndAddContent(bunchOfProducts, 4);

    $(".container").css("display", "block");

    addTableSortEvent($("table"), 4);

    addHighlightingOnTable();
    observeTableMutation();

    let tblLines = $("tbody tr");

    $.each(tblLines, function () {
        for (let i = 0; i < 4; i++) {
            if ($(this).children()[i].textContent == localStorage.getItem("product")) {
                $(this).css("background-color", RED_COLOR);
            }
        }
    });
}


function catchProductFromTable() {
    let tblLines = $("tbody tr");
    let nameSelectProduct;
    $.each(tblLines, function () {
        if ($(this).css("background-color") == RED_COLOR) {
            if (currentNumerOfTableColumns == 4) {
                nameSelectProduct = $(this).children()[1];
            }
            else {
                nameSelectProduct = $(this).children()[0];
            }
        }
    });
    if (nameSelectProduct == undefined) { return undefined; }
    else { return nameSelectProduct.textContent; }
}

function addNewProductInTable(product, numberOfTblColumns) {
    let $tblBody = $('tbody'),
        $tr = $('<tr/>').appendTo($tblBody);

    for (const prop in product) {
        if (numberOfTblColumns == 2 && (prop == "id" || prop == "quantity")) {
            continue;
        }
        if (numberOfTblColumns == 3 && prop == "id") {
            continue;
        }
        $tr.append('<td>' + product[prop] + '</td>');
    }
}

function createNewProduct(product) {
    $.ajax({
        url: "http://localhost:3000/createProduct",
        method: 'POST',
        data: product,
        success: function () {
            console.log("product created successful");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

function setValidationMsg(target, msg) {
    if (msg.length > 0) {
        target.setCustomValidity(msg);
    } else {
        target.setCustomValidity("");
    }
}

function idValidation(value) {
    const input = document.querySelector('#id');
    var issueArr = [];
    if (/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(value)) {
        issueArr.push("No special characters!");
    } else if (!/\d/.test(value)) {
        issueArr.push("Must contain at least one number.");
    } else if (!isUniqueProp("id", value)) {
        issueArr.push("ID must be unique.");
    }
    setValidationMsg(input, issueArr);
}

function nameValidation(value) {
    const input = document.querySelector('#name');
    var issueArr = [];
    if (/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(value)) {
        issueArr.push("No special characters!");
    } else if (!isUniqueProp("name", value)) {
        issueArr.push("Name must be unique.");
    }
    setValidationMsg(input, issueArr)
}

function priceValidation(value) {
    const input = document.querySelector('#price');
    var issueArr = [];
    if (/[^0-9]/.test(value)) {
        issueArr.push("Price can contain only numbers!");
    } else if (!/^.{1,7}$/.test(value)) {
        issueArr.push("Price must be between 1-1000000$.");
    }
    setValidationMsg(input, issueArr)
}

function quantityValidation(value) {
    const input = document.querySelector('#quantity');
    var issueArr = [];
    if (/[^0-9]/.test(value)) {
        issueArr.push("Quantity can contain only numbers!");
    }
    setValidationMsg(input, issueArr)
}

function isUniqueProp(prop, propVal) {
    for (let i = 0; i < bunchOfProducts.length; i++) {
        if (propVal == bunchOfProducts[i][prop]) { return false; }
    }
    return true;
}

function addHighlightingOnTable() {
    $('tbody').on('mouseover', "tr", function () {
        if ($(this).css('background-color') == RED_COLOR) { return; }
        $(this).css('background', 'rgb(216, 99, 99)');
    });

    $('tbody').on('mouseout', "tr", function () {
        if ($(this).css('background-color') == RED_COLOR) { return; }
        $(this).css('background', '');
    });

    $("tbody").off('click', "tr").on("click", "tr", function () {
        console.log(1);
        if ($(this).css("background-color") == RED_COLOR) {
            $(this).css("background", "");
        } else {
            removeHighLight();
            $(this).css("background", "red");
        }
    });
}

function removeHighLight() {
    let $tblLines = $("tr");

    $.each($tblLines, function () {
        if ($(this).css("background-color") == RED_COLOR) {
            $(this).css("background", "");
        }
    });
}

function observeTableMutation() {
    const target = $('table')[0];

    const config = {
        childList: true,
        subtree: true
    };

    const observer = new MutationObserver(addHighlightingOnTable);

    observer.observe(target, config);
}

function removeAndCreateNewSortedTableBody(prop, numberOfTblColumns) {
    let $tbl = $("table");
    let $tableBody = $("tbody");
    removeElementFromRage($tableBody);

    let sortedProducts = bunchOfProducts.slice();
    sortedProducts.sort((a, b) => { return b[prop] - a[prop]; });

    createTableBodyAndAppend($tbl, sortedProducts, numberOfTblColumns);
}

function addTableSortEvent($tbl, numberOfTblColumns) {
    $tbl.on("click", "td", function () {
        let tdContent = $(this).text();
        if (tdContent == "Price") {
            removeAndCreateNewSortedTableBody("price", numberOfTblColumns)
        }
        if (tdContent == "Quantity") {
            removeAndCreateNewSortedTableBody("quantity", numberOfTblColumns)
        }
    });
}

function createTableAndAddContent(products, numberOfTblColumns) {
    let $tbl = $("<table></table>");
    createTableHeadAndAppend($tbl, numberOfTblColumns);
    createTableBodyAndAppend($tbl, products, numberOfTblColumns);
    $tbl.insertBefore($(".buy-product"));
    return $tbl;
}

function createTableAndAddContent_2(products, numberOfTblColumns) {
    let $tbl = $("<table></table>");
    createTableHeadAndAppend($tbl, numberOfTblColumns);
    createTableBodyAndAppend($tbl, products, numberOfTblColumns);
    $tbl.insertAfter('h1');
}

function createTableHeadAndAppend($tbl, numberOfTblColumns) {
    let tblHeadContent = defineTableHeaderContent(numberOfTblColumns),
        $tblHead = $("<thead></thead>"),
        $tr = $("<tr/>").appendTo($tblHead);

    for (let i = 0; i < numberOfTblColumns; i++) {
        $tr.append("<td>" + tblHeadContent[i] + "</td>");
    }
    $tbl.append($tblHead);
}

function createTableBodyAndAppend($tbl, products, numberOfTblColumns) {
    let $tblBody = $("<tbody></tbody>"),
        $tr;

    for (let i = 0; i < products.length; i++) {
        $tr = $("<tr/>").appendTo($tblBody);

        for (const prop in products[i]) {
            if (numberOfTblColumns == 2 && (prop == "id" || prop == "quantity")) {
                continue;
            } else if (numberOfTblColumns == 3 && prop == "id") {
                continue;
            }
            $tr.append("<td>" + products[i][prop] + "</td>");
        }
    }
    $tbl.append($tblBody);
}

function defineTableHeaderContent(numberOfTblColumns) {
    let tblContent = [];
    if (numberOfTblColumns == 2) {
        tblContent = TWO_COLUMN_HEADER_CONTENT.slice();
    } else if (numberOfTblColumns == 3) {
        tblContent = THREE_COLUMN_HEADER_CONTENT.slice();
    } else {
        tblContent = FOUR_COLUMN_HEADER_CONTENT.slice();
    }
    return tblContent;
}


function removeElementFromRage($elem) {
    if ($elem) {
        $elem.remove();
    }
}

function createProductList(propertiesOfProducts) {
    let numberOfProducts = propertiesOfProducts.length,
        buffer,
        productValues = [];

    bunchOfProducts = [];
    for (let i = 0; i < numberOfProducts; i++) {
        productValues = Object.values(propertiesOfProducts[i]);
        buffer = new Product(...productValues);
        bunchOfProducts.push(buffer);
    }
}

function getProductsFromServer() {
    let bunchOfProducts = [];
    $.ajax({
        url: "http://localhost:3000/getProducts",
        method: "POST",
        async: false,
        success: function (serverData) {
            bunchOfProducts = serverData.slice();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
    return bunchOfProducts;
}


function hideTblCreationBtns($target, $btns) {
    $.each($btns, function () {
        if ($(this).attr("class") != $target.attr("class")) {
            $(this).hide();
        }
    });
}

let id = window.location.href.slice(30);
let prodData;
let prodQuant;
let currentPrice;

const $formAdd = $(".buy-some");

let $returnBtn = $('.back');

$returnBtn.click(function () {
    window.location.replace('/');
});

$formAdd.submit(function (e) {
    e.preventDefault();

    $('#contactForm').css("display", "block");
    $('#contactForm').addClass("animated fadeInUp");
    currentPrice = prodData.price * $('#quantity').val();
    $('#buy-price').val(currentPrice);
    return false;
});

$('.popup-form').submit(function (e) {
    e.preventDefault();
    let user = $('.popup-form').serializeArray();

    $(this).trigger("reset");

    user.push({ name: "balance", value: currentPrice });
    user.push({ name: "quantity", value: $('#quantity').val() });
    user.push({ name: "name", value: $('#name').val() });

    $.ajax({
        url: "http://localhost:3000/updateBalance",
        method: 'POST',
        data: user,
        async: false,
        success: function (jsonProd) {
            saveCheck(jsonProd);
            // console.log(jsonProd);
            window.location.replace('/');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
            alert(xhr.responseText);
        }
    });

    return false;
});

function saveCheck(data) {
    let updData = {
        date: new Date(),
        product: data.product.name,
        price: data.product.price * $('#quantity').val(),
        customer: data.user.name
    };

    $.ajax({
        url: "http://localhost:3000/checkList",
        method: 'POST',
        data: updData,
        async: false,
        success: function (jsonProd) {
            // window.location.replace('/');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
            alert(xhr.responseText);
        }
    });
}

function setProductInputs(data) {
    $.ajax({
        url: "http://localhost:3000/getProductFromId",
        method: 'POST',
        data: { id: id },
        async: false,
        success: function (jsonProd) {
            let productValues = Object.values(jsonProd);
            prodQuant = jsonProd.quantity;
            prodData = new Product(...productValues);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });

    $('#name').val(prodData.name);
    $('#price').val(prodData.price);
}

function quantityValidation_1(value) {
    const input = document.querySelector('#quantity');
    var issueArr = [];
    if (prodQuant < Number(value)) {
        issueArr.push("Quantity can't be more then" + prodQuant);
    }
    if (/[^0-9]/.test(value)) {
        issueArr.push("Quantity can contain only numbers!");
    }

    setValidationMsg(input, issueArr)
}

if (window.location.href != 'http://localhost:3000/' && window.location.href != 'http://localhost:3000/check') {
    setProductInputs(id);
}

if (window.location.href == 'http://localhost:3000/check') {
    $.ajax({
        url: "http://localhost:3000/getCheckList",
        method: 'POST',
        async: false,
        success: function (jsonProd) {
            let numberOfProducts = jsonProd.length,
                buffer,
                productValues = [];

            let list = [];
            for (let i = 0; i < numberOfProducts; i++) {
                productValues = Object.values(jsonProd[i]);
                buffer = new Product(...productValues);
                list.push(productValues);
            }
            createTableAndAddContent_2(list, 4);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
            alert(xhr.responseText);
        }
    });
}