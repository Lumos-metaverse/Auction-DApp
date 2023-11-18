import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import auctionContract from "./components/Auction";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [auctionContractInstance, setAuctionContractInstance] = useState();
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState("");
  const [auctionEndTime, setAuctionEndTime] = useState(0);
  const [owner, setOwner] = useState(null);
  const [startPrice, setStartPrice] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [bidAmount, setBidAmount] = useState(null);
  const [cancel, setCanceled] = useState(null);
  const [bidCount, setBidCount] = useState(0);


  const CHAIN_ID = 80001;
  const NETWORK_NAME = "Mumbai";

  console.log(cancel);


  useEffect(() => {
     const fetchAuctionDetails = async () => {
        try {
          if (walletAddress !== ""){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
      
            setSigner(provider.getSigner());
            setAuctionContractInstance(auctionContract(provider));
      
      
            const nftOwner = await auctionContractInstance.nftOwner();
            const startingPrice = await auctionContractInstance.setPrice();
            const timeFrame = await auctionContractInstance.timeLeft();
            const convertToMinutes = timeFrame/60/60/24;
            const higestBidder = await auctionContractInstance.highestBidder();
            const highestBidPrice = await auctionContractInstance.highestBid();
            const cancellationState = await auctionContractInstance.canceled();
            const startCount = await auctionContractInstance.bidCount();

            setOwner(nftOwner);
            setStartPrice(startingPrice);
            setAuctionEndTime(convertToMinutes);
            setHighestBidder(higestBidder);
            setHighestBid(highestBidPrice);
            setCanceled(cancellationState);
            setBidCount(startCount);

          }
        } catch (error) {
          console.error(error);
        }
     }

     fetchAuctionDetails();
  }, [walletAddress]);


  useEffect(() => {
    getCurrentWalletConnected();
   
  }, [walletAddress]);


  

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const accounts = await provider.send("eth_requestAccounts", []);

        const { chainId } = await provider.getNetwork();
        
       console.log( setSigner(provider.getSigner()));
        if (chainId !== CHAIN_ID) {
          window.alert(`Please switch to the ${NETWORK_NAME} network!`);
              throw new Error(`Please switch to the ${NETWORK_NAME} network`);
          }
          setAuctionContractInstance(auctionContract(provider));
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };


  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {

          setSigner(provider.getSigner());
          setAuctionContractInstance(auctionContract(provider));
          setWalletAddress(ethers.utils.getAddress(accounts[0]));
        } else {
          console.log("Connect to MetaMask using the Connect Wallet button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };


  const placeBidHandler = async (e) => {
    e.preventDefault();

    if(bidAmount === null){
      alert("Enter an amount to bid");
    }else{
      if(bidCount > 0){
        if(ethers.utils.parseEther(bidAmount) <= highestBid){
          alert("Bid more than the higest bidder");
        }else{
            try {
              // Connect the signer to the contract
              const connectedContract = auctionContractInstance.connect(signer);
    
              const tx = await connectedContract.placeBid({value: ethers.utils.parseEther(bidAmount.toString())});
              tx.wait();
    
              alert("Bid Placed");
            } catch (error) {
            
                console.error(error);
            }
        }
      }else{
        if(ethers.utils.parseEther(bidAmount) <= startPrice){
          alert("Bid more than the start price bid");
        }else{
            try {
              // Connect the signer to the contract
              const connectedContract = auctionContractInstance.connect(signer);
    
              const tx = await connectedContract.placeBid({value: ethers.utils.parseEther(bidAmount.toString())});
              tx.wait();
    
              alert("Bid Placed");
            } catch (error) {
            
                console.error(error);
            }
        }
      }
    }
  };
  

  const cancelAuctionHandler = async (e) => {
    e.preventDefault();
    
        try {
          // Connect the signer to the contract
          const connectedContract = auctionContractInstance.connect(signer);

          const tx = await connectedContract.cancelAuction();
          tx.wait();

          alert("Auction Cancelled");
        } catch (error) {
            alert(error.error.data.message);
        }
  };

  const startAuctionHandler = async (e) => {
    e.preventDefault();

    
    if(tokenId === null ) {
      alert("Please input token ID to start Auction");
    }else{
        try {
          // Connect the signer to the contract
          const connectedContract = auctionContractInstance.connect(signer);

          const tx = await connectedContract.startAuction(tokenId);
          tx.wait();

          alert("Auction Started");
        } catch (error) {
            alert(error.error.data.message);
        }
    }
  }

  const withdrawAuctionHandler = async (e) => {
    e.preventDefault();

    try{
       // Connect the signer to the contract
       const connectedContract = auctionContractInstance.connect(signer);

       const tx = await connectedContract.withdrawBid();
       tx.wait();
    }catch (error) {
      alert(error.error.data.message);
  }
  };
  
  const getNFTAuctionHandler = async (e) => {
    e.preventDefault();

    try{
       // Connect the signer to the contract
       const connectedContract = auctionContractInstance.connect(signer);

       const tx = await connectedContract.getNFTBid();
       tx.wait();
    }catch (error) {
      alert(error.error.data.message);
  }
  };

  return (
    <div>
      <div className="app">
        <nav className="navbar">
           <button className="connect-wallet-button" onClick={connectWallet}>
           {walletAddress ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Connect Wallet"}
           </button>
        </nav>
        <section className="auction-section">
       
         <div className="bid-section">
            <input onChange={(e) => setBidAmount(e.target.value)} type="number" placeholder="Enter bid amount" />
            <button onClick={placeBidHandler}>Place Bid</button>
         </div>

         <div className="withdraw-section">
            <button onClick={withdrawAuctionHandler} >Withdraw Bid</button>
         </div>
         <div>
             <button onClick={getNFTAuctionHandler}>Get NFT Bid</button>
         </div>
         {/* Display auction information here */}
            <p>Highest Bid: {highestBid !== null && Number(highestBid)}</p>
            <p>Highest Bidder: {highestBidder}</p>
            <p>Auction Ends At: {auctionEndTime}</p>
            <p>Starting Price: {startPrice !== null && Number(startPrice)}</p>
            <p>Is Auction Cancelled? : {cancel === false ? "False" : "True"}</p>
        </section>

       <div>
          {walletAddress !== "" && owner !== null && walletAddress === owner && 
              <div>
                  <div>
                    <input onChange={(e) => setTokenId(e.target.value)} type="number" placeholder="Enter token ID" />
                    <button onClick={startAuctionHandler}>Start Auction</button>
                </div>
                <button onClick={cancelAuctionHandler}>Cancel Auction</button>
              </div>
          }
          <p className="footer">Powered by Lumos</p>
       </div>
     </div>
    </div>
  );
}

export default App;
