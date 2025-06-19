const { task } = require("hardhat/config")

task("deploy-fundme","deploy and verify fundme contract").setAction(async(taskArgs,hre)=>{
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
})

async function verifyFundMe(fundMeAddr,args){
    await hre.run("verify:verify", {
        address: fundMeAddr,    
        constructorArguments:args,
    });
}

    module.exports={}