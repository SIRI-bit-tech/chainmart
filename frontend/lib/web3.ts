import { BrowserProvider, Contract, ethers } from "ethers"
import type { EthereumProvider } from "@/types/global"
import { ACTIVE_NETWORK } from "@/config/constants"

/**
 * Web3 utilities and provider management
 * Production-ready Ethereum/Polygon integration
 * Works with both MetaMask and WalletConnect through Wagmi
 */

export type WalletType = "injected" | "walletconnect" | null

class Web3Service {
  private provider: BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private currentAccount: string | null = null
  private walletType: WalletType = null

  /**
   * Initialize Web3 provider from Wagmi wallet client
   */
  async initFromWalletClient(walletClient: any, connectorId?: string): Promise<BrowserProvider | null> {
    if (!walletClient) return null

    try {
      this.provider = new BrowserProvider(walletClient as any)
      this.currentAccount = walletClient.account?.address || null
      this.walletType = connectorId === "walletConnect" ? "walletconnect" : "injected"
      return this.provider
    } catch (error) {
      console.error("Failed to initialize from wallet client:", error)
      return null
    }
  }

  /**
   * Initialize Web3 provider (fallback for direct MetaMask)
   */
  async init(): Promise<BrowserProvider | null> {
    if (typeof window === "undefined") return null

    const ethereum = window.ethereum as EthereumProvider | undefined
    if (!ethereum) {
      console.log("No wallet detected. Please use the Connect Wallet button.")
      return null
    }

    this.provider = new BrowserProvider(ethereum)
    this.walletType = "injected"

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
   * Set current account (called from useWeb3 hook)
   */
  setAccount(account: string | null): void {
    this.currentAccount = account
  }

  /**
   * Get current account
   */
  getAccount(): string | null {
    return this.currentAccount
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
      return null
    }

    try {
      this.signer = await this.provider.getSigner()
      return this.signer
    } catch (error) {
      console.error("Failed to get signer:", error)
      return null
    }
  }

  /**
   * Get wallet type
   */
  getWalletType(): WalletType {
    return this.walletType
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
      if (typeof window === "undefined") return false
      
      const ethereum = window.ethereum as EthereumProvider | undefined
      if (!ethereum) return false

      const chainIdHex = `0x${ACTIVE_NETWORK.chainId.toString(16)}`

      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })

        return true
      } catch (switchError: any) {
        // Network not added to wallet
        if (switchError.code === 4902) {
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
          })

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
    if (withSigner && this.signer) {
      return new Contract(contractAddress, contractABI, this.signer)
    } else if (this.provider) {
      return new Contract(contractAddress, contractABI, this.provider)
    } else {
      const provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl)
      return new Contract(contractAddress, contractABI, provider)
    }
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
    this.walletType = null
  }
}

export const web3Service = new Web3Service()
