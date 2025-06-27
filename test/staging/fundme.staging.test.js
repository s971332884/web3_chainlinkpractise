const {ethers, deployments, getNamedAccounts} =require("hardhat")
const {assert,expect} =require("chai")
const helpers =require ("@nomicfoundation/hardhat-network-helpers")//专门用于测试和开发智能合约的工具包
const { parseEther } = require("ethers")
const { extendEnvironment } = require("hardhat/config")
const { developmentChains } = require("../../helper.hardhat.config")


!developmentChains.includes("network.name")? 
describe.skip:
describe("test fundme contract",async function(){
    let firstAccount,fundme
    beforeEach(async function(){
        await deployments.fixture(["all"]) //运行部署所有带all标签的脚本并部署全部合约
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundmedeployment = await deployments.get("FundMe")
        fundme=await ethers.getContractAt("FundMe",fundmedeployment.address)//连接到合约，使用默认签名者（第一个账户）
        // getContract来源hardhat-deploy
    })  

    //test fund and getFund successfully
    it("fund and getfund successfully",async function(){
        //make sure target not reached
        await fundme.fund({value:ethers.parseEther("0.5")})

        //make sure window closed
        await new Promise(resolve=>setTimeout(resolve,181*1000))

        //make sure we can get receipt
        const getFundTx=await fundme.getfund()
        const getFundReceipt=await getFundTx.wait()//确保入链

        expect(getFundReceipt).to.be.emit(fundme,"FundWithdrawbyOwner")
        .withArgs(ethers.parseEther("0.5"))
    })

    //test fund and refund successfully
    it("fund and refund seccessfully",async function(){
        //make sure target not reached
        await fundme.fund({value:ethers.parseEther("0.1")})

        //make sure window closed
        await new Promise(resolve=>setTimeout(resolve,181*1000))

        //make sure we can get receipt
        const refundTx=await fundme.refund()
        const refundReceipt=await refundTx.wait()//确保入链

        expect(refundReceipt).to.be.emit(fundme,"RefundByFunder")
        .withArgs(firstAccount,ethers.parseEther("0.1"))
    })
})  