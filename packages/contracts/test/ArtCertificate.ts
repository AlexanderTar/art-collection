import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { getAddress } from "viem";
import hre from "hardhat";

describe("ArtCertificate", function () {
  async function deployArtCertificateFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const artCertificate = await hre.viem.deployContract("ArtCertificate");

    const publicClient = await hre.viem.getPublicClient();
    const walletClient = await hre.viem.getWalletClient(owner.account.address);

    return { artCertificate, owner, otherAccount, publicClient, walletClient };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { artCertificate, publicClient } = await loadFixture(deployArtCertificateFixture);


      const name = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "name",
        args: [],
      });
      expect(name).to.equal("ArtCertificate");

      const symbol = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "symbol",
        args: [],
      });
      expect(symbol).to.equal("ARTCERT");
    });

    it("Should set the right owner", async function () {
      const { artCertificate, owner, publicClient } = await loadFixture(deployArtCertificateFixture);

      const contractOwner = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "owner",
        args: [],
      });
      expect(getAddress(contractOwner)).to.equal(getAddress(owner.account.address));
    });
  });

  describe("Minting", function () {
    it("Should mint a new token", async function () {
      const { artCertificate, owner, walletClient, publicClient } = await loadFixture(deployArtCertificateFixture);

      const tokenUri = "https://example.com/token/1";
      const tx = await walletClient.writeContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "mint",
        args: [tokenUri],
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const events = await publicClient.getContractEvents({
        address: artCertificate.address,
        abi: artCertificate.abi,
        eventName: "CertificateMinted",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      expect(events[0].args.tokenId).to.equal(0n);
      expect(events[0].args.owner).to.not.be.null;
      expect(getAddress(events[0].args.owner!!)).to.equal(getAddress(owner.account.address));
      expect(events[0].args.tokenUri).to.equal(tokenUri);

      const tokenOwner = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "ownerOf",
        args: [0n],
      });
      expect(getAddress(tokenOwner)).to.equal(getAddress(owner.account.address));

      const retrievedTokenUri = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "tokenURI",
        args: [0n],
      });
      expect(retrievedTokenUri).to.equal(tokenUri);
    });
  });

  describe("Token Enumeration", function () {
    async function mintSomeTokensFixture() {
      const { artCertificate, owner, otherAccount, walletClient, publicClient } = await loadFixture(deployArtCertificateFixture);

      await walletClient.writeContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "mint",
        args: ["https://example.com/token/1"],
        account: owner.account.address,
      });
      await walletClient.writeContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "mint",
        args: ["https://example.com/token/2"],
        account: owner.account.address,
      });
      await walletClient.writeContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "mint",
        args: ["https://example.com/token/3"],
        account: otherAccount.account.address,
      });

      return { artCertificate, owner, otherAccount, publicClient, walletClient };
    }

    it("Should return correct tokensOf for an address", async function () {
      const { artCertificate, owner, publicClient } = await loadFixture(mintSomeTokensFixture);

      const tokens = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "tokensOf",
        args: [owner.account.address],
      });
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(0n);
      expect(tokens[1]).to.equal(1n);
    });

    it("Should return correct tokens for a range", async function () {
      const { artCertificate, publicClient } = await loadFixture(mintSomeTokensFixture);

      const tokens = await publicClient.readContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "tokens",
        args: [0n, 3n, false],
      });
      expect(tokens.length).to.equal(3);
      expect(tokens[0]).to.equal(0n);
      expect(tokens[1]).to.equal(1n);
      expect(tokens[2]).to.equal(2n);
    });
  });

  describe("Burning", function () {
    async function mintTokenForBurningFixture() {
      const { artCertificate, owner, otherAccount, walletClient, publicClient } = await loadFixture(deployArtCertificateFixture);

      const tx = await walletClient.writeContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "mint",
        args: ["https://example.com/token/burn"],
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const events = await publicClient.getContractEvents({
        address: artCertificate.address,
        abi: artCertificate.abi,
        eventName: "CertificateMinted",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      expect(events[0].args.tokenId).to.not.be.null;

      return { artCertificate, owner, otherAccount, walletClient, publicClient, tokenId: events[0].args.tokenId!! };
    }

    it("Should allow token owner to burn their token", async function () {
      const { artCertificate, owner, walletClient, publicClient, tokenId } = await loadFixture(mintTokenForBurningFixture);

      const tx = await walletClient.writeContract({
        address: artCertificate.address,
        abi: artCertificate.abi,
        functionName: "burn",
        args: [tokenId],
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const events = await publicClient.getContractEvents({
        address: artCertificate.address,
        abi: artCertificate.abi,
        eventName: "Transfer",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      expect(events[0].args.from).to.not.be.null;
      expect(events[0].args.to).to.not.be.null;
      expect(getAddress(events[0].args.from!!)).to.equal(getAddress(owner.account.address));
      expect(getAddress(events[0].args.to!!)).to.equal(getAddress("0x0000000000000000000000000000000000000000"));
      expect(events[0].args.tokenId).to.equal(0n);

      await expect(
        publicClient.readContract({
          address: artCertificate.address,
          abi: artCertificate.abi,
          functionName: "ownerOf",
          args: [0n],
        })
      ).to.be.rejectedWith("ERC721NonexistentToken");
    });

    it("Should not allow non-owner to burn a token", async function () {
      const { artCertificate, otherAccount, walletClient, tokenId } = await loadFixture(mintTokenForBurningFixture);

      await expect(
        walletClient.writeContract({
          address: artCertificate.address,
          abi: artCertificate.abi,
          functionName: "burn",
          args: [tokenId],
          account: otherAccount.account.address,
        })
      ).to.be.rejectedWith("ERC721InsufficientApproval");
    });
  });
});
