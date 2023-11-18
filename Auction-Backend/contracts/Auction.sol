//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction{
    //////////////////////EVENTS///////////////////
    event AuctionStarted(uint256 endAt);
    event AuctionCanceled();
    event BidPlaced(address bidder, uint256 bid);
    event BidWithdrawn(address bidder, uint256 bid);

    ////////////////STATE VARIABLES////////////////
    IERC721 nftaddress;
    address public nftOwner; 
    uint16 tokenId;
 
    uint64 public timeFrame; 
    bool public canceled;
    bool auctionStarted;

    uint128 public highestBid;
    uint128 public setPrice;

    address payable public highestBidder;

    mapping(address => uint256) bids;
    uint16 public bidCount;

    modifier onlyOwner(){
        require(msg.sender == nftOwner, "Not Owner");
        _;
    }

    modifier timeElapsed(){
        require(block.timestamp < timeFrame, "Auction has ended");
        _;
    }

    constructor(IERC721 _nft, uint64 duration, uint128 price) {
        nftaddress = _nft;
        nftOwner = payable(msg.sender);
        setPrice = price;
        timeFrame = uint64(block.timestamp) + (duration * 1 days);
    }

    ///@dev function that enables the nftOwner to start the auction
    function startAuction(uint16 _tokenId) external onlyOwner{
        require(!auctionStarted, "An auction is currently in progress");
        IERC721(nftaddress).transferFrom(nftOwner, address(this), _tokenId);

        tokenId = _tokenId;
        auctionStarted = true;

        emit AuctionStarted(timeFrame);
    }

    ///@dev function that enables the nftOwner to cancel an ongoing auction
    function cancelAuction() external onlyOwner{
        require(auctionStarted == true, "Auction not available");
        require(!canceled, "Auction already canceled");

        canceled = true;
        nftaddress.safeTransferFrom(address(this), nftOwner, tokenId);
        auctionStarted = false;

        emit AuctionCanceled();
   }  

    ///@dev function that enables user to bid for the nft
    function placeBid() external payable timeElapsed{
        require(auctionStarted == true, "Auction not available");
        require(!canceled, "Auction canceled");
        require(msg.value > setPrice, "Amount too low for a bid");

        require(msg.value > highestBid, "Must beat highest bid");

      
        bids[msg.sender] += msg.value;
        

        highestBidder = payable(msg.sender);
        highestBid = uint128(msg.value);
        bidCount = bidCount + 1;

        emit BidPlaced(msg.sender, msg.value);
  }


    ///@dev function to withdraw bid for all bidders except the user with the highest bid and nft for the highest bidder
    function withdrawBid() external {
        require(block.timestamp > timeFrame, "Auction is still on");      
        require(msg.sender != highestBidder, "You can't withdraw at the moment");
  
        uint256 bidderBal = bids[msg.sender];
        bids[msg.sender] = 0;
   
        payable(msg.sender).transfer(bidderBal);

        emit BidWithdrawn(msg.sender, bidderBal);
    }

    /// @dev function to transfer the NFT
    function getNFTBid() external {
        require(block.timestamp > timeFrame, "Auction is still on");  
        if(highestBid <= setPrice){ 
            nftaddress.safeTransferFrom(address(this), nftOwner, tokenId);
        }
        else{
            nftaddress.safeTransferFrom(address(this), highestBidder, tokenId);
            payable(nftOwner).transfer(highestBid);
        }
    }

    ///@dev function to return time left
    function timeLeft() external view returns(uint32){
        return uint32(timeFrame - block.timestamp);
    }

   
    /// @dev function to return the contract balance 
    function contractBal() external view returns(uint){
            return address(this).balance;
    }

}