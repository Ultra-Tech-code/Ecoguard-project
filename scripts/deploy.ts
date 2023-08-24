import { ethers } from "hardhat";

async function main() {

  const [deployer, seller, buyer, lister, bidder1, bidder2, lister2, conversationprojectaddress] = await ethers.getSigners();

  const MockNFT = await ethers.deployContract("MockNFT");
  await MockNFT.waitForDeployment();

  console.log( `MockNFT deployed to ${MockNFT.target}`);

  //---------------mint Nft---------------//
  const MockNFTinteract = await ethers.getContractAt("MockNFT", MockNFT.target);
  const mintToSeller = await MockNFTinteract.safeMint(seller.address);
  const mintToLister = await MockNFTinteract.safeMint(lister.address);
  const mintTolister2 = await MockNFTinteract.safeMint(lister2.address);
  const minted = await mintToLister.wait();
  console.log( `Nft minted to ${minted}`);

    //Owner of
  const ownerOF = await MockNFTinteract.ownerOf(0);
  console.log( `Nft owner is ${ownerOF}`);
  // console.log(lister.address)

//---------------deploy TestToken---------------//
  const TestToken = await ethers.deployContract("TestToken");
  await TestToken.waitForDeployment();
  console.log( `TestToken deployed to ${TestToken.target}`);

  //---------------mint TestToken---------------//
  const TestTokeninteract = await ethers.getContractAt("TestToken", TestToken.target);
  const mintToBuyer = await TestTokeninteract.mint(buyer.address, ethers.parseEther("100"));
  const mintToBidder1 = await TestTokeninteract.mint(bidder1.address, ethers.parseEther("100"));
  const mintToBidder2 = await TestTokeninteract.mint(bidder2.address, ethers.parseEther("100"));
  mintToBidder2.wait();
  console.log( `Token minted to ${mintToBidder2.wait()}`);


  const Ecoguard = await ethers.deployContract("Ecoguard", [deployer.address, TestToken.target]);
  await Ecoguard.waitForDeployment();

  console.log( `Ecoguard deployed to ${Ecoguard.target}`);


    //---------------approve Nft---------------//
    const approveToSeller = await MockNFTinteract.connect(seller).approve(Ecoguard.target, 0);
    const approveToLister = await MockNFTinteract.connect(lister).approve(Ecoguard.target, 1);
    const approveToLister2 = await MockNFTinteract.connect(lister2).approve(Ecoguard.target, 2);

    console.log( `Nft approved to ${approveToLister.wait()}`);

    //---------------approve TestToken---------------//
    const approveToEcoguard = await TestTokeninteract.connect(buyer).approve(Ecoguard.target, ethers.parseEther("100"));
    const approveToEcoguard1 = await TestTokeninteract.connect(bidder1).approve(Ecoguard.target, ethers.parseEther("100"));
    const approveToEcoguard2 = await TestTokeninteract.connect(bidder2).approve(Ecoguard.target, ethers.parseEther("100"));
    console.log( `Token approved to ${approveToEcoguard1.wait()}`);

  

    //---------------list Nft---------------//
    const duration = 86400; // 1 day

    const listNft = await Ecoguard.connect(seller).createListing(0, MockNFT.target, 2, duration, conversationprojectaddress.address);
    const listed = await listNft.wait();

    console.log( `Nft listed to ${listed}`);

    // @ts-ignore
    //listNft.events.forEach((event) => {  if (event.event === "ListingSuccessfull") { console.log(event.args); }});

    //---------------buy Nft---------------//
     const buyNft = await Ecoguard.connect(buyer).purchaseNFT(0);

    //-------------balance of seller and buyer-------------//
    const balanceOfSeller = await TestTokeninteract.balanceOf(seller.address);
    const balanceOfBuyer = await TestTokeninteract.balanceOf(buyer.address);
    const balanceOfPlatform = await TestTokeninteract.balanceOf(Ecoguard.target);
    console.log( `balance of seller is ${balanceOfSeller}`);
    console.log( `balance of buyer is ${balanceOfBuyer}`);
    console.log( `balance of platform is ${balanceOfPlatform}`);


    const nftbalanceOfSeller = await MockNFTinteract.ownerOf(0);
    console.log( `Nft owner is ${nftbalanceOfSeller}`);
    console.log( `buyers address is ${buyer.address}`);
  


    //---------------Auction NFT --------//
    const auctionNft = await Ecoguard.connect(lister).startAuction(1, MockNFT.target, 2, duration);
    console.log( `Nft auction to ${auctionNft.wait()}`);


    //---------------Bid Nft---------------//
    const bidNft = await Ecoguard.connect(bidder1).placeBid(1, 1);
    console.log( `Nft bid to ${bidNft.wait()}`);

        //-------------balance of seller and buyer-------------//
        const balanceOfLister = await TestTokeninteract.balanceOf(lister.address);
        const balanceOfBidder = await TestTokeninteract.balanceOf(bidder1.address);
        const platformBal = await TestTokeninteract.balanceOf(Ecoguard.target);
        console.log( `balance of Lister is ${balanceOfLister}`);
        console.log( `balance of Bidder is ${balanceOfBidder}`);
        console.log( `balance of platform is ${platformBal}`);


      //---------------Finalize Nft---------------//
      //cant finalize cos paymnet not payout price
      // const finalizeNft = await Ecoguard.connect(lister).finalizeAuction(1);
      // console.log( `Nft bid to ${finalizeNft.wait()}`);



      const tokenOwer = await MockNFTinteract.ownerOf(1);
      console.log( `Nft owner is ${tokenOwer}`);
      console.log( `Ecoguard address is ${Ecoguard.target}`);
      console.log( `balance of bidder is ${bidder1.address}`);


      //---------------Bidder 2 Nft---------------//

      const bid2Nft = await Ecoguard.connect(bidder2).placeBid(1, 2);
      console.log( `Nft bid to ${bid2Nft.wait()}`);

            //---------------Finalize Nft---------------//
  
      const finalizedNft = await Ecoguard.connect(bidder2).finalizeAuction(1);
      console.log( `Nft bid to ${finalizedNft.wait()}`);



      const tokenOwer2 = await MockNFTinteract.ownerOf(1);
      console.log( `Nft owner is ${tokenOwer2}`);
      console.log( `Ecoguard address is ${Ecoguard.target}`);
      console.log( `Address of bidder2 is ${bidder2.address}`);

      const balanceOfBidder1 = await TestTokeninteract.balanceOf(bidder1.address);
      console.log( `balance of bidder1 is ${balanceOfBidder1}, bidder 1 got his funds back`);

      const balancesOfPlatform = await TestTokeninteract.balanceOf(Ecoguard.target);
      console.log( `balance of Platform is ${balancesOfPlatform}, PLATFORM  got his PLATFROM FEES`);

      const listerBalance = await TestTokeninteract.balanceOf(lister.address);
      console.log( `balance of lister is ${listerBalance}, lister  got his money`);

  //should revert cos nft has been bought already
      // const bidNftagain = await Ecoguard.connect(buyer).placeBid(1, 2);
      // console.log( `Nft bid to ${bidNftagain.wait()}`);


      //--------------Withdraw Nft-----------------//
      // const withdrawNft = await Ecoguard.connect(lister2).withdrawNFT(2);
      // console.log( `Nft bid to ${withdrawNft.wait()}`);

//--------------------------------------create listing and only the listing should be able to withdraw nft if not bought--------------------
      //--------------create listing again-----------------//
      // const listNft2 = await Ecoguard.connect(lister2).createListing(2, MockNFT.target, 2, duration, lister2.address);
      // const listed2 = await listNft2.wait();
      // console.log( `Nft listed to ${listed2}`);

      //      // --------------Withdraw Nft-----------------//
      // const withdrawNft = await Ecoguard.connect(lister).withdrawNFT(2);
      // console.log( `Nft bid to ${withdrawNft.wait()}`);


//------------------start auction and withdarw nft if no bid-----------------//

      //--------------start auction---------//
      const auctionNft2 = await Ecoguard.connect(lister2).startAuction(2, MockNFT.target, 2, duration);
      console.log( `Nft auction to ${auctionNft2.wait()}`);

      const withdrawNft = await Ecoguard.connect(lister2).withdrawNFT(2);
      console.log( `Nft bid to ${withdrawNft.wait()}`);



      //-------------Donate to project-------------//
      const donateToProject = await Ecoguard.connect(buyer).donateToProject(0, 2);
      console.log( `Nft bid to ${donateToProject.wait()}`);

      const balanceOfconversationprojectaddress = await TestTokeninteract.balanceOf(conversationprojectaddress.address);
      console.log( `balance of conversationproject is ${balanceOfconversationprojectaddress}, `);


      //-------------Withdraw from project-------------//
      const withdrawFromProject = await Ecoguard.connect(deployer).withdrawPlatformFee();
      console.log( `Nft bid to ${withdrawFromProject.wait()}`);

      const deployerBal = await TestTokeninteract.balanceOf(deployer.address);
      console.log( `balance of deployer is ${deployerBal}, `);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
