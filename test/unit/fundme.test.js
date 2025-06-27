const {ethers, deployments, getNamedAccounts} =require("hardhat")
const {assert,expect} =require("chai")
const helpers =require ("@nomicfoundation/hardhat-network-helpers")//专门用于测试和开发智能合约的工具包
const { parseEther } = require("ethers")
const { extendEnvironment } = require("hardhat/config")
const { developmentChains } = require("../../helper.hardhat.config")


developmentChains.includes("network.name")? 
describe.skip:
describe("test fundme contract",async function(){
    let firstAccount,fundme,mockV3Aggregator,fundMeSecondAccount,secondAccount
    beforeEach(async function(){
        await deployments.fixture(["all"]) //运行部署所有带all标签的脚本并部署全部合约
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundmedeployment = await deployments.get("FundMe")
        mockV3Aggregator =await deployments.get("MockV3Aggregator")
        fundme=await ethers.getContractAt("FundMe",fundmedeployment.address)//连接到合约，使用默认签名者（第一个账户）
        fundMeSecondAccount=await ethers.getContract("FundMe",secondAccount)//连接到同一个合约，但使用不同签名者
        // getContract来源hardhat-deploy
    })  

    it("test if the owner is msg.sender",async function(){
        // const [firstAccount]=await ethers.getSigners()
        // const fundmeFactory=await ethers.getContractFactory("FundMe")
        // const fundme= await fundmeFactory.deploy(180)        
        await fundme.waitForDeployment()
        assert.equal((await fundme.owner()),firstAccount) //如用getSignersr需要调用firstAccount.address
    })
    
    it("test if the datefeed is assigned corrrectly",async function(){
        // const fundmeFactory=await ethers.getContractFactory("FundMe")
        // const fundme= await fundmeFactory.deploy(180)        
        await fundme.waitForDeployment()
        assert.equal((await fundme.dataFeed()),mockV3Aggregator.address)
    })
    
    //fund
    it("window closed,value greater than minimum,fund failed",
        async function () {
            await helpers.time.increase(200)
            await helpers.mine()//模拟挖矿，使时间超过200s

            await expect(fundme.fund({value:ethers.parseEther("0.1")}))
            .to.be.revertedWith("window is closed")  
        }
    )

    it("window open,value greater than minimum,fund failed",
        async function () {
            expect(fundme.fund({value:ethers.parseEther("0.01")}))
            .to.be.revertedWith("send more eth")  
        }
    )

    it("window open,value is greater minimum ,fund success",
       async function () {
          //greater than minimum
          await fundme.fund({value:ethers.parseEther("0.1")})
          const balance=await fundme.fundersToAmount(firstAccount)
          expect(balance).to.equal(ethers.parseEther("0.1"))
       }
    )

    //getfund
    it("not owner,window closed,target reached,getFund failed",
        async function(){
            await fundme.fund({value:ethers.parseEther("1")})

            await helpers.time.increase(200)
            await helpers.mine()

            await expect(fundMeSecondAccount.getfund())
            .to.be.revertedWith("the function can be called by the owner")
            
        }
    )

    it("window open,target reached,getFund failed",async function(){
        await fundme.fund({value:ethers.parseEther("1")})

        await expect(fundme.getfund()).to.be.revertedWith("Windows is not closed")
    })

    it("window closed,target not reached,getFund failed",async function(){
        await fundme.fund({value:ethers.parseEther("0.1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundme.getfund())
        .to.be.revertedWith("TARGET is not reached")
    })

    it("window closed,target reached,getFund success",async function(){
        await fundme.fund({value:ethers.parseEther("1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundme.getfund()).to.be.emit(fundme,"FundWithdrawbyOwner")
        .withArgs(ethers.parseEther("1"))
    })

    //refund
    it("window open,target not reached,funder has balance",async function(){
        await fundme.fund({value:ethers.parseEther("0.1")})

        await expect(fundme.refund()).to.be.revertedWith("Windows is not closed")

    })

    it("window closed,target reached,funder has balance",async function(){
        await fundme.fund({value:ethers.parseEther("1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundme.refund()).to.be.revertedWith("the balance is  reached for the TARGET")

    })

    it("window closed,target reached,funder has balance",async function(){
        await fundme.fund({value:ethers.parseEther("1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundme.refund()).to.be.revertedWith("the balance is  reached for the TARGET")

    })

    it("window closed,target not reached,funder not has balance",async function(){
        await fundme.fund({value:ethers.parseEther("0.1")})

        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundMeSecondAccount.refund()).to.be.revertedWith("there is no fund for you")

    })

    it("window closed,target not reached,funder has balance",async function () {
        await fundme.fund({value:ethers.parseEther("0.1")})
        
        await helpers.time.increase(200)
        await helpers.mine()

        await expect(fundme.refund()).to.be
        .emit(fundme,"RefundByFunder")//合约名字和event名字
        .withArgs(firstAccount,ethers.parseEther("0.1"))
      
    })
})  