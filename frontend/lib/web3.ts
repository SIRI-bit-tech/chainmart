import { BrowserProvider, Contract, ethers } from "ethers"
import type { EthereumProvider, EthereumRequest } from "@/types/global"
import { ACTIVE_NETWORK } from "@/config/constants"

/**
 * Web3 utilities and provider management
 * Production-ready Ethereum/Polygon integration
 */

class Web3Service {
  private provider: BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private currentAccount: string | null = null

  /**
   * Initialize Web3 provider
   */
  async init(): Promise<BrowserProvider | null> {
    if (typeof window === "undefined") return null

    const ethereum = window.ethereum as EthereumProvider | undefined
    if (!ethereum) {
      console.error("MetaMask not found")
      return null
    }

    this.provider = new BrowserProvider(ethereum)

    // Listen for account changes
    ethereum.on("accountsChanged", (accounts: unknown) => {
      const accountsList = accounts as string[]
      this.currentAccount = accountsList[0] || null
      window.dispatchEvent(new Event("accountsChanged"))
    })

    // Listen for chain changes
    ethereum.on("chainChanged", () => {
      window.location.reload()
    })

    return this.provider
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<string | null> {
    try {
      const ethereum = window.ethereum as EthereumProvider | undefined
      if (!ethereum) throw new Error("MetaMask not found")

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      } as EthereumRequest)) as string[]

      this.currentAccount = accounts[0]
      await this.checkNetwork()

      return this.currentAccount
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  /**
   * Get current account
   */
  async getAccount(): Promise<string | null> {
    if (!this.provider) {
      await this.init()
    }

    if (this.currentAccount) {
      return this.currentAccount
    }

    try {
      const ethereum = window.ethereum as EthereumProvider | undefined
      if (!ethereum) return null

      const accounts = (await ethereum.request({
        method: "eth_accounts",
      } as EthereumRequest)) as string[]

      this.currentAccount = accounts[0] || null
      return this.currentAccount
    } catch (error) {
      console.error("Failed to get account:", error)
      return null
    }
  }

  /**
   * Get provider
   */
  getProvider(): BrowserProvider | null {
    return this.provider
  }

  /**
   * Get signer
   */
  async getSigner(): Promise<ethers.Signer | null> {
    if (!this.provider) {
      await this.init()
    }

    if (!this.provider) return null

    try {
      this.signer = await this.provider.getSigner()
      return this.signer
    } catch (error) {
      console.error("Failed to get signer:", error)
      return null
    }
  }

  /**
   * Check network and switch if needed
   */
  async checkNetwork(): Promise<boolean> {
    try {
      const chainId = await this.getChainId()

      if (chainId !== ACTIVE_NETWORK.chainId) {
        return await this.switchNetwork()
      }

      return true
    } catch (error) {
      console.error("Network check failed:", error)
      return false
    }
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<number> {
    try {
      const provider = this.provider || (await this.init())
      if (!provider) throw new Error("Provider not initialized")

      const network = await provider.getNetwork()
      return Number(network.chainId)
    } catch (error) {
      console.error("Failed to get chain ID:", error)
      throw error
    }
  }

  /**
   * Switch network to Polygon
   */
  async switchNetwork(): Promise<boolean> {
    try {
      const ethereum = window.ethereum as EthereumProvider | undefined
      if (!ethereum) return false

      const chainIdHex = `0x${ACTIVE_NETWORK.chainId.toString(16)}`

      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        } as EthereumRequest)

        return true
      } catch (switchError: unknown) {
        const error = switchError as { code?: number }

        // Network not added to wallet
        if (error.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: ACTIVE_NETWORK.name,
                rpcUrls: [ACTIVE_NETWORK.rpcUrl],
                blockExplorerUrls: [ACTIVE_NETWORK.blockExplorerUrl],
                nativeCurrency: ACTIVE_NETWORK.nativeCurrency,
              },
            ],
          } as EthereumRequest)

          return true
        }

        return false
      }
    } catch (error) {
      console.error("Failed to switch network:", error)
      return false
    }
  }

  /**
   * Sign message with wallet
   */
  async signMessage(message: string): Promise<string> {
    try {
      const signer = await this.getSigner()
      if (!signer) throw new Error("Signer not available")

      const signature = await signer.signMessage(message)
      return signature
    } catch (error) {
      console.error("Failed to sign message:", error)
      throw error
    }
  }

  /**
   * Get user balance
   */
  async getBalance(account: string): Promise<string> {
    try {
      const provider = this.provider || (await this.init())
      if (!provider) throw new Error("Provider not initialized")

      const balance = await provider.getBalance(account)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error("Failed to get balance:", error)
      throw error
    }
  }

  /**
   * Get contract instance
   */
  getContract(contractAddress: string, contractABI: ethers.InterfaceAbi, withSigner = true): Contract {
    let provider: BrowserProvider | ethers.JsonRpcProvider

    if (withSigner && this.signer) {
      provider = this.signer
    } else if (this.provider) {
      provider = this.provider
    } else {
      provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl)
    }

    return new Contract(contractAddress, contractABI, provider)
  }

  /**
   * Call contract function (read-only)
   */
  async callContract(contract: Contract, functionName: string, args: unknown[] = []): Promise<unknown> {
    try {
      const result = await contract[functionName](...args)
      return result
    } catch (error) {
      console.error(`Failed to call contract function ${functionName}:`, error)
      throw error
    }
  }

  /**
   * Send contract transaction
   */
  async sendTransaction(
    contract: Contract,
    functionName: string,
    args: unknown[] = [],
  ): Promise<ethers.ContractTransactionResponse | null> {
    try {
      const tx = await contract[functionName](...args)
      return tx as ethers.ContractTransactionResponse
    } catch (error) {
      console.error(`Failed to send transaction for ${functionName}:`, error)
      throw error
    }
  }

  /**
   * Wait for transaction
   */
  async waitForTransaction(tx: ethers.ContractTransactionResponse): Promise<ethers.ContractTransactionReceipt | null> {
    try {
      const receipt = await tx.wait()
      return receipt as ethers.ContractTransactionReceipt | null
    } catch (error) {
      console.error("Failed to wait for transaction:", error)
      throw error
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null
    this.signer = null
    this.currentAccount = null
  }
}

export const web3Service = new Web3Service()
