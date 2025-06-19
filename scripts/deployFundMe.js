//import ether.js,即部署合约用的框架
//create main function
//execute main function

const { ethers } = require ("hardhat") //从框架中只提取ether，即解构

async function main(){
    //create factory
    const fundmeFactory =await ethers.getContractFactory("FundMe")
    console.log("contract deploying")
    
    //deploy contract from factory
    const fundme=await fundmeFactory.deploy(180)
    await fundme.waitForDeployment() //等待入链
    console.log(`contract has been deployed successfully,contract address is+ ${fundme.target}`)//teplate符,fundme.target指部署的合约地址
    
    //verify FundMe
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        console.log("waiting for 5 confirmations")
        await fundme.deploymentTransaction().wait(5)//等待浏览器写入自己数据库，等几个区块,提高成功率
        await verifyFundMe(fundme.target,[10])
    }else{
        console.log("vertification skipped..");
    }

    //init 2 accounts
    const [firstamount,secondamount]=await ethers.getSigners()//调用配置中的amount
    //fund contract with first account
    const fundTX = await fundme.fund({value:ethers.parseEther("0.1")})
    await fundTX.wait()//等待入块
    //check balance of contract
    const balanceOfContract =await ethers.provider.getBalance(fundme.target)
    console.log(`balance of contract is${balanceOfContract}`);
    //fund contract with second account
    const fundTxwithsecondAccount=await fundme.connect(secondamount).fund({value:ethers.parseEther("0.1")})
    await fundTxwithsecondAccount.wait()//等待入块
    //check balance of contract
    const balanceOfContractaftersecondFund=await ethers.provider.getBalance(fundme.target)
    console.log(`balance of contract is${balanceOfContractaftersecondFund}`);
    //check mapping fundersToAmount
    const firstamountbalanceinFundme=await fundme.fundersToAmount(firstamount.address)
    const secondtamountbalanceinFundme=await fundme.fundersToAmount(secondamount.address)
    console.log(`Balance of first account ${firstamount.address} is ${firstamountbalanceinFundme}`);
    console.log(`Balance of second account ${secondamount.address} is ${secondtamountbalanceinFundme}`);
    

    
}

    async function verifyFundMe(fundMeAddr,args){
        await hre.run("verify:verify", {
            address: fundMeAddr,    
            constructorArguments:args,
        });
    }


//()=>{} ()表函数入参，{}表函数体，=>表我传的是一个函数
main().then().catch((error)=>{
    console.error(error)
    process.exit(0)
})