const fs = require('fs');
const {
    convertArrayToCSV
} = require('convert-array-to-csv');
admin_html = '';
cashfree_html = '';
bank_html = '';
// const longProcess = async (body) => {
module.exports = function (body, callback) {
    var admin_bank_id = null;
    var admin_cashfree_id = null;
    var admin_amount = null;
    var cashfree_id = null;
    var cashfree_amount = null;
    var bank_id = null;
    var bank_amount = null;
    var Admin_head = []
    var Cashfree_head = [];
    admin_amount_total = 0
    var admin_arr = [];

    var obj = body.obj;
    var obj1 = body.obj1;
    var obj2 = body.obj2;
    console.log("obj", obj)
    for (let k = 0; k < obj[0].data.length; k++) {
        if (k == 0) {
            for (let i = 0; i < obj[0].data[0].length; i++) {
                Admin_head.push(obj[0].data[0][i]);
                if (body.admin_bank_id == obj[0].data[0][i].trim()) {
                    admin_bank_id = i;
                }
                if (body.admin_cashfree_id == obj[0].data[0][i].trim()) {
                    admin_cashfree_id = i;
                }
                if (body.admin_amount == obj[0].data[0][i].trim()) {
                    admin_amount = i;
                }
            }
        } else {
            if (obj[0].data[k].length > 0) {
                admin_arr.push(obj[0].data[k]);
                admin_amount_total = admin_amount_total + parseInt(obj[0].data[k][admin_amount]);
            }
        }
    }
    Admin_head.push('Cashfree Id');
    Admin_head.push('Cashfree Amount')
    Admin_head.push('Cashfree Diff')
    Admin_head.push('Bank Id');
    Admin_head.push('Bank Amount')
    Admin_head.push('Bank Diff')
    cashfree_amount_total = 0;
    var cashfree_arr = [];
    for (let k = 0; k < obj1[0].data.length; k++) {
        if (k == 0) {
            for (let i = 0; i < obj1[0].data[0].length; i++) {
                Cashfree_head.push(obj1[0].data[0][i]);

                if (body.cashfree_id == obj1[0].data[0][i].trim()) {
                    cashfree_id = i;
                }

                if (body.cashfree_amount == obj1[0].data[0][i].trim()) {
                    cashfree_amount = i;
                }

            }
        } else {
            if (obj1[0].data[k].length > 0) {
                cashfree_arr.push(obj1[0].data[k]);
                cashfree_amount_total = cashfree_amount_total + parseInt(obj1[0].data[k][cashfree_amount])
            }
        }
    }
    cashfree_arr = cashfree_arr.sort(function (a, b) {
        return a[cashfree_id] > b[cashfree_id] ? 1 : -1;
    });
    // console.log("inside2222...........")
    Cashfree_head.push('Admin Id');
    Cashfree_head.push('Admin Amount');
    Cashfree_head.push('Admin Diff');

    Bank_head = []
    var bank_arr = [];
    bank_amount_total = 0
    for (let k = 0; k < obj2[0].data.length; k++) {
        if (k == 0) {
            for (let i = 0; i < obj2[0].data[0].length; i++) {
                Bank_head.push(obj2[0].data[0][i]);

                if (body.bank_id == obj2[0].data[0][i].trim()) {
                    bank_id = i;
                }

                if (body.bank_amount == obj2[0].data[0][i].trim()) {
                    bank_amount = i;
                }

            }
        } else {
            if (obj2[0].data[k].length > 0) {
                let str = obj2[0].data[k][bank_id].toString();
                let matches = str.match(/(\d+)/);
                obj2[0].data[k][bank_id] = matches[0];
                bank_arr.push(obj2[0].data[k]);

                bank_amount_total = bank_amount_total + parseInt(obj2[0].data[k][bank_amount])
            }
        }
    } // ---------------------------------------
    bank_arr = bank_arr.sort(function (a, b) {
        return a[bank_id] > b[bank_id] ? 1 : -1;
    });
    // -------------------------------------------
    Bank_head.push('Admin Id');
    Bank_head.push('Admin Amount');
    Bank_head.push('Admin Diff');

    console.log("---", admin_bank_id, "----", admin_cashfree_id, "----",
        admin_amount, "------", cashfree_id, "---", cashfree_amount, "====",
        bank_id, "---", bank_amount);

    obj[0].data.shift();
    obj1[0].data.shift();
    obj2[0].data.shift();
    len1 = admin_arr.length
    len2 = cashfree_arr.length
    len3 = bank_arr.length
    console.log(len1)
    console.log(len2)
    console.log(len3)


    var admin_count = 0;
    admin_count1 = 0;
    var flag = 0;
    var cashfree_flag = 0;
    var cashfree_amount_match = 0;
    var cashfree_amount_diff = 0;
    var only_cashfree_diff_count = 0;
    var count_cashfree_idnot_match = 0;
    console.log(len1, "::", len2)
    var cashfree_duplicate_check = [];
    var check_browser_count_for_cashfree = 0
    var check_browser_count_for_cashfree1 = 0;
    var check_browser_count_for_cashfree2 = 0
    // -----------------------------------------------------------------------------------------
    for (let i = 0; i < len1; i++) {
        // process.send({
        //   isCompleted: false,
        //   total_count: len1 + len1,
        //   data: i
        // });
        flag = 0;
        cashfree_flag = 0;
        cashfree_amount_diff = 0;
        k = 0;
        let cash_id = admin_arr[i][admin_cashfree_id]; // == [j][cashfree_id]
        let res = binarySearch(cashfree_arr, len2, cash_id);
        if (res != -1) {
            // console.log("res", res)
            flag = 1;
            cashfree_amount_diff = parseInt(admin_arr[i][admin_amount]) - parseInt(res[0][cashfree_amount]);
            cashfree_amount_diff1 = parseInt(res[0][cashfree_amount]) - parseInt(admin_arr[i][admin_amount]);
            if (admin_arr[i][admin_amount] == res[0][cashfree_amount]) {

                cashfree_flag = 1;
                cashfree_amount_match = cashfree_amount_match + 1;
                admin_count = admin_count + 1;
                admin_arr[i].push(res[0][cashfree_id])
                admin_arr[i].push(res[0][cashfree_amount])
                admin_arr[i].push(cashfree_amount_diff)
                // console.log("admin_arr[i]", admin_arr[i])
                cashfree_arr[res[1]].push(admin_arr[i][admin_cashfree_id])
                cashfree_arr[res[1]].push(admin_arr[i][admin_amount])
                cashfree_arr[res[1]].push(cashfree_amount_diff1)
                cashfree_duplicate_check.push(admin_arr[i])
                // console.log("cashfree_arr[res[1]]", cashfree_arr[res[1]])
                check_browser_count_for_cashfree = check_browser_count_for_cashfree + 1
                if (check_browser_count_for_cashfree < 500) {
                    admin_html = admin_html + `<tr><td>` + res[0][cashfree_id] + `</td><td>` + res[0][cashfree_amount] + `</td><td>` + cashfree_amount_diff + `</td></tr>`;
                    // console.log("working......sss")
                    cashfree_html = cashfree_html + `<tr><td>` + admin_arr[i][admin_cashfree_id] + `</td><td>` + admin_arr[i][admin_amount] + `</td><td>` + cashfree_amount_diff1 + `</td></tr>`;
                }
                // console.log("working......111")
            }
            if (cashfree_flag == 0) {
                admin_arr[i].push(admin_arr[i][admin_cashfree_id])
                admin_arr[i].push(res[0][cashfree_amount])
                admin_arr[i].push(cashfree_amount_diff)
                cashfree_arr[res[1]].push(admin_arr[i][admin_cashfree_id])
                cashfree_arr[res[1]].push(admin_arr[i][admin_amount])
                cashfree_arr[res[1]].push(cashfree_amount_diff1)
                cashfree_duplicate_check.push(admin_arr[i])
                check_browser_count_for_cashfree1 = check_browser_count_for_cashfree1 + 1
                if (check_browser_count_for_cashfree1 < 500) {
                    admin_html = admin_html + `<tr><td>` + admin_arr[i][admin_cashfree_id] + `</td><td>` + admin_arr[i][admin_amount] + `</td><td>` + cashfree_amount_diff + `</td></tr>`;
                    cashfree_html = cashfree_html + `<tr><td>` + admin_arr[i][admin_cashfree_id] + `</td><td>` + res[0][cashfree_amount] + `</td><td>` + cashfree_amount_diff1 + `</td></tr>`;
                }
                admin_count = admin_count + 1;
                flag = 1;
            }
        }
        if (flag == 0 && cashfree_flag == 0) {
            admin_arr[i].push("N/A")
            admin_arr[i].push("N/A")
            admin_arr[i].push("N/A")
            admin_count = admin_count + 1;
            count_cashfree_idnot_match = count_cashfree_idnot_match + 1;
            check_browser_count_for_cashfree2 = check_browser_count_for_cashfree2 + 1;
            if (check_browser_count_for_cashfree2 < 500) {
                admin_html = admin_html + `<tr><td>` + admin_arr[i][admin_cashfree_id] + `</td><td>` + admin_arr[i][admin_amount] + `</td><td>N/a</td></tr>`;
            }
        }
        if (flag == 1 && cashfree_flag == 0) { //show  diff  amonut ie: id match but not amount 
            only_cashfree_diff_count = only_cashfree_diff_count + 1
        }
    }

    function binarySearch(cashfree_arr, len2, cash_id) {
        let start = 0;
        let stop = len2 - 1;
        let middle = Math.floor((start + stop) / 2)
        let temp_arr = [];
        while (cashfree_arr[middle][cashfree_id] !== cash_id && start < stop) {

            if (cash_id < cashfree_arr[middle][cashfree_id]) {
                stop = middle - 1
            } else {
                start = middle + 1
            }
            // console.log(start, "start", stop, "stop", middle, "middle");
            if (start < 0 || stop < 0) {
                // console.log(middle, "middle33");
                return -1
            }
            middle = Math.floor((start + stop) / 2)

        }


        if (cashfree_arr[middle][cashfree_id] !== cash_id) {
            return -1;
        } else {
            // console.log(middle, "middle22");
            temp_arr = [];
            temp_arr.push(cashfree_arr[middle]);
            temp_arr.push(middle);
            return temp_arr;
        }
    }
    cashfree_arr.unshift(Cashfree_head);
    console.log("finished..1")

    // =======================Admin with Bank==========================================
    admin_count = 0;
    admin_count1 = 0;

    flag = 0;
    bank_flag = 0;
    bank_amount_match = 0;
    bank_amount_diff = 0;
    only_bank_diff_count = 0;
    count_bank_idnot_match = 0;
    bank_duplicate_check = []

    var check_browser_count_for_bank = 0
    var check_browser_count_for_bank1 = 0
    var check_browser_count_for_bank2 = 0
    // -------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------
    for (let i = 0; i < len1; i++) {
        // process.send({
        //   isCompleted: false,
        //   total_count: len1 + len1,
        //   data_1: i,
        //   data: len1
        // });
        flag = 0;
        bank_flag = 0;
        k = 0;
        let cash_id = admin_arr[i][admin_bank_id];
        let res = binarySearch1(bank_arr, len3, cash_id);
        if (res != -1) {
            // console.log("res", res)
            flag = 1;
            bank_amount_diff = parseInt(admin_arr[i][admin_amount]) - parseInt(res[0][bank_amount]);
            bank_amount_diff1 = parseInt(res[0][bank_amount]) - parseInt(admin_arr[i][admin_amount]);
            if (admin_arr[i][admin_amount] == res[0][bank_amount]) {

                bank_flag = 1;
                bank_amount_match = bank_amount_match + 1;
                admin_count = admin_count + 1;
                admin_arr[i].push(res[0][bank_id])
                admin_arr[i].push(res[0][bank_amount])
                admin_arr[i].push(bank_amount_diff)
                bank_arr[res[1]].push(admin_arr[i][admin_bank_id])
                bank_arr[res[1]].push(admin_arr[i][admin_amount])
                bank_arr[res[1]].push(bank_amount_diff1)
                bank_duplicate_check.push(admin_arr[i])
                check_browser_count_for_bank = check_browser_count_for_bank + 1
                if (check_browser_count_for_bank < 500) {
                    admin_html = admin_html + `<tr><td>` + res[0][bank_id] + `</td><td>` + res[0][bank_amount] + `</td><td>` + bank_amount_diff + `</td></tr>`;
                    bank_html = bank_html + `<tr><td>` + admin_arr[i][admin_bank_id] + `</td><td>` + admin_arr[i][admin_amount] + `</td><td>` + bank_amount_diff1 + `</td></tr>`;
                }
                // console.log("working......111")
            }
            if (bank_flag == 0) {
                // console.log("workig2222222222");
                admin_arr[i].push(admin_arr[i][admin_bank_id])
                admin_arr[i].push(res[0][bank_amount])
                admin_arr[i].push(bank_amount_diff)
                // console.log("workig3333333");
                bank_arr[res[1]].push(admin_arr[i][admin_bank_id])
                bank_arr[res[1]].push(admin_arr[i][admin_amount])
                bank_arr[res[1]].push(bank_amount_diff1)
                // console.log("workig4444");
                bank_duplicate_check.push(admin_arr[i])
                check_browser_count_for_bank1 = check_browser_count_for_bank1 + 1
                if (check_browser_count_for_bank1 < 500) {
                    admin_html = admin_html + `<tr><td>` + admin_arr[i][admin_bank_id] + `</td><td>` + admin_arr[i][admin_amount] + `</td><td>` + bank_amount_diff + `</td></tr>`;
                    bank_html = bank_html + `<tr><td>` + admin_arr[i][admin_bank_id] + `</td><td>` + res[0][bank_amount] + `</td><td>` + bank_amount_diff1 + `</td></tr>`;
                }
                // console.log("workig55555555");
                admin_count = admin_count + 1;
                flag = 1;
            }
        }
        if (flag == 0 && bank_flag == 0) {
            // console.log("workig1111111111");
            admin_arr[i].push("N/A")
            admin_arr[i].push("N/A")
            admin_arr[i].push("N/A")
            admin_count = admin_count + 1;
            count_bank_idnot_match = count_bank_idnot_match + 1;
            check_browser_count_for_bank2 = check_browser_count_for_bank2 + 1;
            if (check_browser_count_for_bank2 < 500) {
                admin_html = admin_html + `<tr><td>` + admin_arr[i][admin_bank_id] + `</td><td>` + admin_arr[i][admin_amount] + `</td><td>N/a</td></tr>`;
            }
        }
        if (flag == 1 && bank_flag == 0) { //show  diff  amonut ie: id match but not amount 
            only_bank_diff_count = only_bank_diff_count + 1
        }
    }

    function binarySearch1(bank_arr, len2, cash_id) {
        // console.log(len2, "len2");
        let start = 0;
        let stop = len2 - 1;
        let middle = Math.floor((start + stop) / 2)
        let temp_arr = [];
        while (parseInt(bank_arr[middle][bank_id]) !== parseInt(cash_id) && start < stop) {
            if (cash_id < bank_arr[middle][bank_id]) {
                stop = middle - 1
            } else {
                start = middle + 1
            }
            if (start < 0 || stop < 0) {
                return -1
            }
            middle = Math.floor((start + stop) / 2)
        }
        if (parseInt(bank_arr[middle][bank_id]) !== cash_id) {
            return -1;
        } else {
            temp_arr = [];
            temp_arr.push(bank_arr[middle]);
            temp_arr.push(middle);
            return temp_arr;
        }
    }
    admin_arr.unshift(Admin_head)
    bank_arr.unshift(Bank_head);
    console.log("---- finished ...........2");

    var duplicates = [];
    for (let i = 0; i < bank_duplicate_check.length; i++) {
        let cash_id = bank_duplicate_check[i][admin_cashfree_id];
        let bank_id = bank_duplicate_check[i][admin_bank_id];
        let len = cashfree_duplicate_check.length;
        let res = binarySearch2(cashfree_duplicate_check, len, cash_id, bank_id, type = 3);
        if (res != -1) {
            bank_duplicate_check[i].push("duplicate\n");
            duplicates.push(bank_duplicate_check[i])
        }
    }


    function binarySearch2(arr, len2, cash_id, bank_id, type) {
        let start = 0;
        let stop = len2 - 1;
        let middle = Math.floor((start + stop) / 2)
        let temp_arr = [];
        if (type == 3) {
            while (parseInt(arr[middle][admin_bank_id]) !== parseInt(bank_id) && parseInt(arr[middle][admin_cashfree_id]) !== parseInt(cash_id) && start < stop) {
                if (cash_id < arr[middle][admin_bank_id]) {
                    stop = middle - 1
                } else {
                    start = middle + 1
                }
                if (start < 0 || stop < 0) {
                    return -1
                }
                middle = Math.floor((start + stop) / 2)
            }
            if (parseInt(arr[middle][admin_bank_id]) !== cash_id) {
                return -1;
            } else {
                temp_arr = [];
                temp_arr.push(arr[middle]);
                temp_arr.push(middle);
                return temp_arr;
            }
        }
    }
    admin_arr.push(duplicates)
    // =================================================================================


    // ===========================CSV================================
    try {
        const Admin_csv_file = convertArrayToCSV(admin_arr, {
            separator: ',',
        });
        let admin_file = fs.writeFileSync("public/withdraw/admin.csv", Admin_csv_file);
        if (admin_file) {
            console.log("Admin File created");
        }
        const Cash_free_csv = convertArrayToCSV(cashfree_arr, {
            separator: ',',
        });
        let cashfree_file = fs.writeFileSync("public/withdraw/cashfree.csv", Cash_free_csv);
        if (cashfree_file) {
            console.log("CashFree File created");
        }
        const Bank_csv = convertArrayToCSV(bank_arr, {
            separator: ',',
        });
        let bank_file = fs.writeFileSync("public/withdraw/bank.csv", Bank_csv);
        if (bank_file) {
            console.log("Bank File created");

        }
        // return true;
        let json_data = {
            isCompleted: true,
            "cashfree_html": cashfree_html,
            "admin_html": admin_html,
            "bank_html": bank_html,
            "admin_count": len1,
            "cashfree_count": len2,
            "bank_count": len3,
            "cashfree_amount_total": cashfree_amount_total,
            "bank_amount_total": bank_amount_total,
            "admin_amount_total": admin_amount_total
        }
        callback(null, json_data)
    } catch (error) {
        console.log("error", error)
        // process.send({
        //   success: false,
        //   msg: error.message
        // })
    }

    // }

    // // process.on('message', async (req) => {
    // //   try {
    // //     const result = await longProcess(req);
    // //     if (result) {
    // //       process.send({
    // //         isCompleted: true,
    // //         "cashfree_html": cashfree_html,
    // //         "admin_html": admin_html,
    // //         "bank_html": bank_html,
    // //         "admin_count": len1,
    // //         "cashfree_count": len2,
    // //         "bank_count": len3,
    // //         "cashfree_amount_total": cashfree_amount_total,
    // //         "bank_amount_total": bank_amount_total,
    // //         "admin_amount_total": admin_amount_total
    // //       });
    // //     }
    // //   } catch (error) {
    // //     process.send({
    // //       isCompleted: false,
    // //       msg: error.message
    // //     })
    // //   }
    // // });
    // var j = 0;
    // for (var i = 0; i < 10; i++) {
    //     j++;
    // console.log(j, "----", inp);

    // }

}