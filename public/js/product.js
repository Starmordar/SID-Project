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

// class Product {
//     constructor(id, name, price, quantity) {
//         this.id = id;
//         this.name = name;
//         this.price = price;
//         this.quantity = quantity;
//     }
// }

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

// function setValidationMsg(target, msg) {
//     if (msg.length > 0) {
//         target.setCustomValidity(msg);
//     } else {
//         target.setCustomValidity("");
//     }
// }

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

setProductInputs(id);