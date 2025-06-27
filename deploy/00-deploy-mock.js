
const {DECIMAL,INITIAL_ANSWER, developmentChains} =require ("../helper.hardhat.config")
module.exports=async({getNamedAccounts,deployments})=>{

if(developmentChains.includes(network.name)){
    const firstAccount=(await getNamedAccounts()).firstAccount
    console.log(`first Account is ${firstAccount}`)
    console.log("this a deploy function")
    const {deploy} =deployments
    await deploy("MockV3Aggregator",{
        from:firstAccount,
        args:[DECIMAL,INITIAL_ANSWER],
        log:true
    })
}else{
    console.log("environmenet is not local,mock contract is skipped");
    
}
    
}

module.exports.tags=["all","fundme"]