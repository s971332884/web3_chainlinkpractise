const DECIMAL=8
const INITIAL_ANSWER=300000000000 //后8位代表精度
const developmentChains=["hardhat","local"]
const Lock_Time=180
const CONFIRMATIONS=5

const networkConfig={
    11155111:{
        ethUsdDataFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    56:{
        ethUsdDataFeed:"0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}

module.exports={
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    networkConfig,
    Lock_Time,
    CONFIRMATIONS
}