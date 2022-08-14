import { useEffect, useState } from 'react';
import Web3 from 'web3';
import React from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "../utils/contractLoader";
import styles from '../stylesheets/card.module.css';
import icon_arrow from '../stylesheets/arrow.png'
import icon_profile from '../stylesheets/Profile.png'
// npm install --save react-scripts@4.0.3

export default function Card() {
    const [account, setAccount] = useState({ address: null, balance: null });
    const [contractBalance, setContractBalance] = useState(0.0);
    const [web3Api, setWeb3Api] = useState({
        provider: null,
        web3: null,
        contract: null
    })

    async function updateContractBalance() {
        console.log('upadting contract balance');
        let _balance = await web3Api.web3.eth.getBalance(web3Api.contract.address);
        _balance = web3Api.web3.utils.fromWei(_balance, "ether");
        _balance = parseFloat(_balance).toFixed(2);
        web3Api.contract && setContractBalance(_balance);
    }

    async function transferFund() {
        const { provider, web3, contract } = web3Api;
        var amount = document.getElementById("amount").value;
        //console.log(` amount ${typeof (amount)}`);
        // console.log( await contract.methods['no_ofFunders()'].call());
        //await contract.methods.transferFunding().call();
        if (amount != '' && account.address) {
            await contract.methods['payFund()'].sendTransaction({
                from: account.address,
                value: web3.utils.toWei(amount, "ether"),
            });
            await updateContractBalance();
        }

        let _address = account['address'];
        if (_address) {
            console.log("updatig account balance");
            let _balance = await web3Api.web3.eth.getBalance(account['address']);
            _balance = web3Api.web3.utils.fromWei(_balance, "ether");
            _balance = parseFloat(_balance).toFixed(2);
            setAccount({ address: _address, balance: _balance });
        }
    }

    async function withdrawFund() {
        const { provider, web3, contract } = web3Api;
        
        let owner = await contract.owner.call();

        if (owner == account.address)
        {
            await contract.transferFunding({
                from: account.address
            });
            await updateContractBalance();
            
            let _address = account['address'];
            if (_address) {
                console.log("updatig account balance");
                let _balance = await web3Api.web3.eth.getBalance(account['address']);
                _balance = web3Api.web3.utils.fromWei(_balance, "ether");
                _balance = parseFloat(_balance).toFixed(2);
                setAccount({ address: _address, balance: _balance });
            }
        }
        else
        {
            console.log("Only owner can withdraw an amount");
        }
        
    }

    //effect used for connecting with metamask
    useEffect(() => {
        let connect = async () => {

            const _provider = await detectEthereumProvider();

            if (_provider) {
                console.log('Ethereum provider detected!');
                _provider.request({
                    method: 'eth_requestAccounts'
                });
                let _contract = await loadContract('Funder', _provider);
                setWeb3Api({ provider: _provider, web3: new Web3(_provider), contract: _contract });
            } else {
                console.error('Please install MetaMask!')
            }
            ////////// traditional way to connect metamask
            // let _provider = null;
            // console.log("effect is called");
            // if (window.ethereum) {
            //     console.log("ethereium provider detected");
            //     _provider = window.ethereum;
            //     try {
            //         await _provider.enable();
            //     } catch (error) {
            //         console.log("user rejected to connect");
            //         console.log("error");
            //     }
            // }
            // else if (window.web3) {
            //     _provider = window.web3.currentProvider();
            //     try {
            //         await _provider.enable();
            //     } catch (error) {
            //         console.log("user rejected to connect");
            //         console.log("error");
            //     }
            // }
            // else if (!process.env.production) {
            //     _provider = new Web3.providers.HttpProviders('http://127.0.0.1:7545');
            //     try {
            //         await _provider.enable();
            //     } catch (error) {
            //         console.log("user rejected to connect");
            //         console.log("error");
            //     }
            // }
        }
        connect();
    }, [])

    //effect used for getting acccount data  after loging in
    useEffect(() => {
        let getAccounts = async () => {
            const accounts = await web3Api.web3.eth?.getAccounts();
            console.log("fetching accounts");
            let _balance = await web3Api.web3.eth.getBalance(accounts[0]);
            _balance = web3Api.web3.utils.fromWei(_balance, "ether");
            _balance = parseFloat(_balance).toFixed(2);
            setAccount({ address: accounts[0], balance: _balance });
            await updateContractBalance();
        }
        web3Api.web3 && getAccounts();
    }, [web3Api.web3])

    //event listener to detect account switch
    window.ethereum.on('accountsChanged', async function () {
        console.log("account changed");
        const accounts = await web3Api.web3.eth?.getAccounts();
        let _balance = await web3Api.web3.eth.getBalance(accounts[0]);
        _balance = web3Api.web3.utils.fromWei(_balance, "ether");
        _balance = parseFloat(_balance).toFixed(2);
        setAccount({ address: accounts[0], balance: _balance });
    })
    // window.ethereum.on('networkChanged', function (networkId) {
    //     // Time to reload your interface with the new networkId
    // })


    var boldHeading = {
        fontWeight: '780'
    }


    return (
        <>
            <header>
                <div className={" container"}>
                    <div className="row justify-content-between">
                        <div className={" col-md-5 my-4 ms-2"} style={{ display: 'flex', alignItems: 'center' }}>
                            <h1 className={styles.textStyle} style={{ fontWeight: '800', fontSize: '45px' }}>Crowd Funding</h1>
                        </div>

                        <div className={" col-md-5 my-4 ms-2"}>
                            <img src={icon_profile} alt="" style={{ marginLeft: '40%', marginRight: '40%' }} />
                            <p className={styles.plainText + " mt-3"} style={{ fontWeight: '100', fontSize: '18px', textAlign: 'center', color: '#ABABAB' }}>{account['address'] ? `${account['address']}` : ' Not Connected'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <section className={" container mt-5"}>
                <div className={" row justify-content-center"}>
                    <div className={styles.card + " col-md-8 py-5 mt-5 "}>
                        {/* first row Gathered amount */}
                        <div className={" row ms-5 mt-5 pt-5"}>
                            <div className={"col-12"}>
                                <h1 className={styles.textStyle} style={boldHeading}>Gathered</h1>
                            </div>

                            <div className={"col-md-2 ms-2"} style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={styles.plainText}>{contractBalance} ETH</div>
                            </div>

                            <div className={"col-md-3"}>
                                <button className={styles.withdrwaBtn + " " + styles.plainText}onClick={withdrawFund}>Withdraw</button>
                            </div>
                        </div>

                        {/* second row Balance*/}
                        <div className={" row ms-5 mt-5 pt-5"}>
                            <div className={" col-12"}>
                                <h1 className={styles.textStyle} style={boldHeading}>Balance</h1>
                            </div>

                            <div className={" ms-2 mt-1 col-md-12"} style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={styles.plainText}>{account['balance']} ETH</div>
                            </div>
                        </div>

                        {/* third row transfer*/}
                        <div className={" row mt-5 py-5 justify-content-center"}>
                            <div className={" col-2 form-outline"}>
                                <input type="number" id="amount" className={styles.amountInput + " form-control " + styles.plainText} min={"1"} />
                            </div>

                            <div className={" col-3 form-outline"}>
                                <button className={styles.transferBtn} onClick={transferFund}>{'\u00A0'}{'\u00A0'}Transfer{'\u00A0'}<img src={icon_arrow} alt="" /></button>
                            </div>

                        </div>


                    </div>
                </div>
            </section>

        </>
    )
}

//update user balance
//update design
//upload to git githun