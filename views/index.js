// metamask is installed
function isInstalled() {
    if (typeof web3 !== 'undefined') {
        console.log('MetaMask is installed')
    }
    else {
        console.log('MetaMask is not installed')
    }
}

isInstalled();

// metamask is locked
function isLocked() {
    web3.eth.getAccounts(function (err, accounts) {
        if (err != null) {
            console.log(err)
        }
        else if (accounts.length === 0) {
            console.log('MetaMask is locked')
        }
        else {
            console.log('MetaMask is unlocked')
        }
    });
}

isLocked();


// check balance
function checkBalance() {
    tokenInst.balanceOf(
        web3.eth.accounts[0],
        function (error, result) {
            if (!error && result) {
                var balance = result.c[0];
                if (balance < balanceNeeded * (100000000)) {
                    console.log('MetaMask shows insufficient balance')
                    return false;
                }
                console.log('MetaMask shows sufficient balance')
                // Include here your transaction function here
            }
            else {
                console.error(error);
            }
            return false;
        });
}

checkBalance();


// all
var transactionApproval = true;

function validate() {
    if (typeof web3 !== 'undefined') {
        console.log('MetaMask is installed')
        web3.eth.getAccounts(function (err, accounts) {
            if (err != null) {
                console.log(err)
            }
            else if (accounts.length === 0) {
                console.log('MetaMask is locked')
            }
            else {
                console.log('MetaMask is unlocked')

                tokenInst.balanceOf(
                    web3.eth.accounts[0],
                    function (error, result) {

                        if (!error && result) {
                            var balance = result.c[0];
                            if (balance < dappCost * (100000000)) {
                                console.log('MetaMask has insufficient balance')
                                return false;
                            }
                            console.log('MetaMask has balance')
                            if (transactionApproval == true) {
                                requestApproval();
                                transactionApproval = false;
                            }
                        }
                        else {
                            console.error(error);
                        }
                        return false;
                    });
            }
        });
    }
    else {
        console.log('MetaMask is not installed')
    }
}
// request approval from MetaMask user
function requestApproval() {
    tokenInst.approve(
        addrHOLD,
        truePlanCost,
        { gasPrice: web3.toWei('50', 'gwei') },
        function (error, result) {

            if (!error && result) {
                var data;
                console.log('approval sent to network.');
                var url = 'https://etherscan.io/tx/' + result;
                var link = '<a href=\"" + url + "\" target=\"_blank\">View Transaction</a>';
                console.log('waiting for approval ...');
                data = {
                    txhash: result,
                    account_type: selectedPlanId,
                    txtype: 1, // Approval
                };
                apiService(data, '/transaction/create/', 'POST')
                    .done(function (response) {
                        location.href = response.tx_url;
                    });
            }
            else {
                console.error(error);
                console.log('You rejected the transaction');
            }
        });
}