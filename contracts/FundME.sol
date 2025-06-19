// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//写fund函数，判定是否满足最小值，然后键值对
//预言机datafeed，参考chainlink
//定义owner，构造初始owner，转移owner函数中判断当前owner是否等于发送者
//写getfund，设置目标值Target，判定目标值、owner，然后payable
    // bool success;
    // (success,)=payable(msg.sender).call{value:address(this).balance}("");
//写refund，判目标值是否达到，判键值对是否空，然后payable回去，注意call{value:fundersToAmount[msg.sender] 
//在getfund和refund中设定执行后fundToAmount[msg.sender]=0
//设置时间戳、locktime，用modifier附在
//modifier，将owner从getfund和transferownership中省去

contract FundMe{
    mapping(address=>uint256) public  fundersToAmount;

    AggregatorV3Interface internal dataFeed;
    address public owner;
    uint256 constant MINIMUM_VALUE = 100*10**18;//代表100美元，10**18与convertEthToUsd中的wei数量抵消
    uint256 constant TARGET = 1000*10**18;

    uint256 deploymentTimestamp;
    uint256 locktime;

    address public erc20Addr;
    bool public FundSuccess=false ; 
    function fund() external payable {
        require(convertEthToUsd(msg.value)>=MINIMUM_VALUE,"Funding amount is too low");
        require(block.timestamp<deploymentTimestamp+locktime,"Windows is closed");
        fundersToAmount[msg.sender]=msg.value;  
        FundSuccess=true;
    }

    constructor(uint256 _locktime) {
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner= msg.sender;
        deploymentTimestamp = block.timestamp;
        locktime= _locktime;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function transferOwnership(address newowner) public onlyOwner{   
        owner=newowner;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256)
    {
         uint256 ethprice=uint256(getChainlinkDataFeedLatestAnswer());   
         return ethAmount*ethprice/(10**8);//ethprice后8位是精度，需要除去
         //ETH/USD presion 10**8
         //X/ETH presion 10**18
    }

    function getfund() external windowsclosed onlyOwner{
        require(convertEthToUsd(address(this).balance)>=TARGET,"TARGET is not reached");
        bool success;
        (success,)=payable(msg.sender).call{value:address(this).balance}("");
        fundersToAmount[msg.sender]=0;
        FundSuccess=true;
    }
    
    function refund() external windowsclosed{
        require(convertEthToUsd(address(this).balance)<TARGET,"the balance is not reached for the TARGET");
        require(fundersToAmount[msg.sender]!=0,"there is no fund for you");
        bool success;
        (success,)=payable(msg.sender).call{value:fundersToAmount[msg.sender]}("");
        require(success,"transfer tx failed");
        fundersToAmount[msg.sender]=0;
    }
    
    function setFunderToAmount(address funder,uint256 amountToUpdate) external{
        require(msg.sender==erc20Addr,"you dont have permission to call this function");
        fundersToAmount[funder]=amountToUpdate;  
    }
    function setErc20Addr(address _erc20addr) public onlyOwner{
        erc20Addr=_erc20addr;
    }
    

    modifier onlyOwner(){
        require( msg.sender == owner,"the function can be called by the owner");
        _;
    }

    modifier windowsclosed(){
        require(block.timestamp>=deploymentTimestamp+locktime,"Windows is closed");
        _;
    }

}