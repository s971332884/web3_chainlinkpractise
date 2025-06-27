const { network } = require("hardhat")
const { developmentChains, networkConfig, Lock_Time, CONFIRMATIONS } = require("../helper.hardhat.config")

module.exports=async({getNamedAccounts,deployments})=>{
    const firstAccount=(await getNamedAccounts()).firstAccount
    console.log(`first Account is ${firstAccount}`)
    console.log("this a deploy function")
    const {deploy} =deployments

    let dataFeedAddr 
    let confirmations
    if(developmentChains.includes(network.name)){
        const mockV3Aggregator =await deployments.get("MockV3Aggregator")
        dataFeedAddr =mockV3Aggregator.address
        confirmations=0
    }else{
        dataFeedAddr=networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations=CONFIRMATIONS
    }

    const fundMe= await deploy("FundMe",{
        from:firstAccount,
        args:[Lock_Time,dataFeedAddr],  
        log:true,
        waitConfirmations:confirmations
        //均为deploy的官方参数名，不可更改
    })
    //重新部署需remove deployments directory or add --reset tag if you redeploy contract 

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        await hre.run("verify:verify", {
            address: fundMe.address,    
            constructorArguments:[Lock_Time,dataFeedAddr],
        });
    }else{
        console.log("network is not sepolia ,verication skipped");
    }
    
}

module.exports.tags=["all","fundme"]