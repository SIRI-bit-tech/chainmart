// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IReputationNFT {
    function updateReputation(address user, uint256 newScore) external;
    function mintSellerBadge(address seller, uint256 reputationLevel) external;
}

/**
 * @title MarketplaceEscrow
 * @dev Production-ready escrow contract for multi-vendor marketplace on Polygon
 * Handles product listings, purchases, payments, disputes, and fund distribution
 */
contract MarketplaceEscrow is ReentrancyGuard, Ownable, Pausable {
    
    // Enums
    enum OrderStatus {
        ACTIVE,
        PAYMENT_HELD,
        COMPLETED,
        DISPUTED,
        REFUNDED,
        CANCELLED
    }
    
    enum DisputeStatus {
        NONE,
        RAISED,
        INVESTIGATING,
        RESOLVED
    }
    
    // Structs
    struct Listing {
        uint256 listingId;
        address seller;
        bytes32 productHash;
        uint256 price;
        address paymentToken;
        bool isActive;
        uint256 createdAt;
        uint256 totalSales;
    }
    
    struct Order {
        uint256 orderId;
        uint256 listingId;
        address buyer;
        address seller;
        uint256 amount;
        address paymentToken;
        OrderStatus status;
        DisputeStatus disputeStatus;
        uint256 createdAt;
        uint256 completedAt;
        address disputer;
        string disputeReason;
    }
    
    struct SellerEscrow {
        uint256 totalEscrow;
        uint256 totalEarned;
        uint256 totalWithdrawn;
        uint256 reputation;
    }
    
    // State variables
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(address => SellerEscrow) public sellerData;
    mapping(address => mapping(address => uint256)) public escrowBalance;
    
    uint256 public platformFeePercentage = 250; // 2.5% (in basis points)
    uint256 public disputeResolutionWindow = 7 days;
    uint256 public platformBalance;
    
    uint256 private listingCounter;
    uint256 private orderCounter;
    
    address public platformWallet;
    IReputationNFT public reputationNFT;
    
    // Supported payment tokens
    mapping(address => bool) public supportedTokens;
    
    // Events
    event ListingCreated(uint256 indexed listingId, address indexed seller, bytes32 productHash, uint256 price, address paymentToken);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed listingId, address indexed buyer, address seller, uint256 amount);
    event PaymentHeld(uint256 indexed orderId, uint256 amount, address paymentToken);
    event OrderCompleted(uint256 indexed orderId, address indexed seller, uint256 sellerAmount, uint256 platformFee);
    event DisputeRaised(uint256 indexed orderId, address indexed disputer, string reason);
    event DisputeResolved(uint256 indexed orderId, address indexed winner, string resolution);
    event FundsWithdrawn(address indexed seller, uint256 amount, address token);
    event PlatformFeeUpdated(uint256 newFee);
    event TokenAdded(address indexed token);
    event ReputationUpdated(address indexed user, uint256 newScore);
    
    // Modifiers
    modifier onlySellerOrPlatform(uint256 _orderId) {
        Order storage order = orders[_orderId];
        require(msg.sender == order.seller || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier orderExists(uint256 _orderId) {
        require(orders[_orderId].orderId != 0, "Order does not exist");
        _;
    }
    
    modifier listingActive(uint256 _listingId) {
        require(listings[_listingId].isActive, "Listing is not active");
        _;
    }
    
    modifier validToken(address _token) {
        require(supportedTokens[_token] || _token == address(0), "Token not supported");
        _;
    }
    
    constructor(address _platformWallet, address _reputationNFT) {
        platformWallet = _platformWallet;
        reputationNFT = IReputationNFT(_reputationNFT);
        listingCounter = 1;
        orderCounter = 1;
        
        // Enable native currency (MATIC) by default
        supportedTokens[address(0)] = true;
    }
    
    // ========== LISTING MANAGEMENT ==========
    
    /**
     * @dev Creates a new product listing
     * @param _productHash IPFS hash of product metadata
     * @param _price Price of the product
     * @param _paymentToken Address of ERC20 token or address(0) for native currency
     */
    function createListing(
        bytes32 _productHash,
        uint256 _price,
        address _paymentToken
    ) external validToken(_paymentToken) whenNotPaused returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(_productHash != 0, "Invalid product hash");
        
        uint256 listingId = listingCounter++;
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            productHash: _productHash,
            price: _price,
            paymentToken: _paymentToken,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0
        });
        
        emit ListingCreated(listingId, msg.sender, _productHash, _price, _paymentToken);
        return listingId;
    }
    
    /**
     * @dev Deactivates a listing
     */
    function deactivateListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Only seller can deactivate");
        listing.isActive = false;
    }
    
    /**
     * @dev Updates listing price
     */
    function updateListingPrice(uint256 _listingId, uint256 _newPrice) external {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Only seller can update");
        require(_newPrice > 0, "Invalid price");
        listing.price = _newPrice;
    }
    
    // ========== PURCHASE & ESCROW ==========
    
    /**
     * @dev Buyer purchases a product - funds held in escrow
     * @param _listingId ID of the listing to purchase
     */
    function purchaseProduct(uint256 _listingId) 
        external 
        payable 
        listingActive(_listingId) 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        Listing storage listing = listings[_listingId];
        require(msg.sender != listing.seller, "Seller cannot buy own product");
        
        if (listing.paymentToken == address(0)) {
            // Native currency payment
            require(msg.value == listing.price, "Incorrect payment amount");
            
            uint256 orderId = orderCounter++;
            
            orders[orderId] = Order({
                orderId: orderId,
                listingId: _listingId,
                buyer: msg.sender,
                seller: listing.seller,
                amount: listing.price,
                paymentToken: address(0),
                status: OrderStatus.PAYMENT_HELD,
                disputeStatus: DisputeStatus.NONE,
                createdAt: block.timestamp,
                completedAt: 0,
                disputer: address(0),
                disputeReason: ""
            });
            
            // Hold funds in escrow
            escrowBalance[listing.seller][address(0)] += listing.price;
            listing.totalSales += 1;
            
            emit OrderPlaced(orderId, _listingId, msg.sender, listing.seller, listing.price);
            emit PaymentHeld(orderId, listing.price, address(0));
            
            return orderId;
        } else {
            // ERC20 token payment
            IERC20 token = IERC20(listing.paymentToken);
            
            require(
                token.transferFrom(msg.sender, address(this), listing.price),
                "Token transfer failed"
            );
            
            uint256 orderId = orderCounter++;
            
            orders[orderId] = Order({
                orderId: orderId,
                listingId: _listingId,
                buyer: msg.sender,
                seller: listing.seller,
                amount: listing.price,
                paymentToken: listing.paymentToken,
                status: OrderStatus.PAYMENT_HELD,
                disputeStatus: DisputeStatus.NONE,
                createdAt: block.timestamp,
                completedAt: 0,
                disputer: address(0),
                disputeReason: ""
            });
            
            // Hold funds in escrow
            escrowBalance[listing.seller][listing.paymentToken] += listing.price;
            listing.totalSales += 1;
            
            emit OrderPlaced(orderId, _listingId, msg.sender, listing.seller, listing.price);
            emit PaymentHeld(orderId, listing.price, listing.paymentToken);
            
            return orderId;
        }
    }
    
    // ========== ORDER COMPLETION & DISTRIBUTION ==========
    
    /**
     * @dev Completes order and releases funds to seller (called by buyer after receiving product)
     * @param _orderId ID of the order to complete
     */
    function completeOrder(uint256 _orderId) 
        external 
        orderExists(_orderId) 
        nonReentrant 
        whenNotPaused 
    {
        Order storage order = orders[_orderId];
        require(order.buyer == msg.sender, "Only buyer can complete order");
        require(order.status == OrderStatus.PAYMENT_HELD, "Order not in held status");
        require(order.disputeStatus == DisputeStatus.NONE, "Order has dispute");
        
        // Calculate fees
        uint256 platformFee = (order.amount * platformFeePercentage) / 10000;
        uint256 sellerAmount = order.amount - platformFee;
        
        // Update order status
        order.status = OrderStatus.COMPLETED;
        order.completedAt = block.timestamp;
        
        // Distribute funds
        _distributeFunds(
            order.seller,
            platformWallet,
            sellerAmount,
            platformFee,
            order.paymentToken
        );
        
        // Update seller data
        sellerData[order.seller].totalEarned += sellerAmount;
        
        // Increase seller reputation
        if (address(reputationNFT) != address(0)) {
            sellerData[order.seller].reputation += 10;
            try reputationNFT.updateReputation(order.seller, sellerData[order.seller].reputation) {} catch {}
        }
        
        emit OrderCompleted(_orderId, order.seller, sellerAmount, platformFee);
    }
    
    /**
     * @dev Distributes funds after order completion
     * @param _seller Address of seller
     * @param _platform Address of platform wallet
     * @param _sellerAmount Amount for seller
     * @param _platformFee Platform fee
     * @param _token Payment token address
     */
    function _distributeFunds(
        address _seller,
        address _platform,
        uint256 _sellerAmount,
        uint256 _platformFee,
        address _token
    ) internal {
        // Update escrow balances
        escrowBalance[_seller][_token] -= (_sellerAmount + _platformFee);
        
        if (_token == address(0)) {
            // Native currency
            (bool success, ) = _seller.call{value: _sellerAmount}("");
            require(success, "Seller payment failed");
            
            (bool platformSuccess, ) = _platform.call{value: _platformFee}("");
            require(platformSuccess, "Platform fee transfer failed");
        } else {
            // ERC20 token
            IERC20 token = IERC20(_token);
            require(token.transfer(_seller, _sellerAmount), "Seller token transfer failed");
            require(token.transfer(_platform, _platformFee), "Platform fee transfer failed");
        }
        
        platformBalance += _platformFee;
    }
    
    // ========== DISPUTE RESOLUTION ==========
    
    /**
     * @dev Raises a dispute on an order
     * @param _orderId ID of the order
     * @param _reason Reason for dispute
     */
    function raiseDispute(uint256 _orderId, string calldata _reason) 
        external 
        orderExists(_orderId) 
        whenNotPaused 
    {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer || msg.sender == order.seller, "Not authorized to dispute");
        require(order.status == OrderStatus.PAYMENT_HELD, "Can only dispute held orders");
        require(order.disputeStatus == DisputeStatus.NONE, "Dispute already raised");
        require(block.timestamp <= order.createdAt + disputeResolutionWindow, "Dispute window closed");
        
        order.status = OrderStatus.DISPUTED;
        order.disputeStatus = DisputeStatus.RAISED;
        order.disputer = msg.sender;
        order.disputeReason = _reason;
        
        emit DisputeRaised(_orderId, msg.sender, _reason);
    }
    
    /**
     * @dev Resolves a dispute (only platform owner)
     * @param _orderId ID of the order
     * @param _winner Address of winner (buyer gets refund, seller gets payment)
     */
    function resolveDispute(uint256 _orderId, address _winner) 
        external 
        orderExists(_orderId) 
        onlyOwner 
        nonReentrant 
    {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.DISPUTED, "Order not disputed");
        
        address loser = _winner == order.buyer ? order.seller : order.buyer;
        require(_winner == order.buyer || _winner == order.seller, "Invalid winner");
        
        order.disputeStatus = DisputeStatus.RESOLVED;
        
        if (_winner == order.buyer) {
            // Refund buyer
            order.status = OrderStatus.REFUNDED;
            escrowBalance[order.seller][order.paymentToken] -= order.amount;
            
            if (order.paymentToken == address(0)) {
                (bool success, ) = order.buyer.call{value: order.amount}("");
                require(success, "Refund failed");
            } else {
                IERC20 token = IERC20(order.paymentToken);
                require(token.transfer(order.buyer, order.amount), "Token refund failed");
            }
            
            // Decrease seller reputation
            if (address(reputationNFT) != address(0)) {
                sellerData[order.seller].reputation = sellerData[order.seller].reputation > 20 
                    ? sellerData[order.seller].reputation - 20 
                    : 0;
            }
        } else {
            // Release to seller
            order.status = OrderStatus.COMPLETED;
            uint256 platformFee = (order.amount * platformFeePercentage) / 10000;
            uint256 sellerAmount = order.amount - platformFee;
            
            _distributeFunds(
                order.seller,
                platformWallet,
                sellerAmount,
                platformFee,
                order.paymentToken
            );
            
            sellerData[order.seller].totalEarned += sellerAmount;
        }
        
        emit DisputeResolved(_orderId, _winner, "Resolved by platform");
    }
    
    /**
     * @dev Auto-resolves disputes after resolution window - favors seller
     * @param _orderId ID of the order
     */
    function autoResolveDispute(uint256 _orderId) 
        external 
        orderExists(_orderId) 
        nonReentrant 
    {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.DISPUTED, "Order not disputed");
        require(
            block.timestamp > order.createdAt + disputeResolutionWindow + 3 days,
            "Resolution window not closed"
        );
        
        // Release to seller
        order.status = OrderStatus.COMPLETED;
        order.disputeStatus = DisputeStatus.RESOLVED;
        
        uint256 platformFee = (order.amount * platformFeePercentage) / 10000;
        uint256 sellerAmount = order.amount - platformFee;
        
        _distributeFunds(
            order.seller,
            platformWallet,
            sellerAmount,
            platformFee,
            order.paymentToken
        );
        
        sellerData[order.seller].totalEarned += sellerAmount;
        emit DisputeResolved(_orderId, order.seller, "Auto-resolved by timeout");
    }
    
    // ========== SELLER FUNCTIONS ==========
    
    /**
     * @dev Allows seller to withdraw earnings
     * @param _amount Amount to withdraw
     * @param _token Token to withdraw (address(0) for native)
     */
    function withdrawEarnings(uint256 _amount, address _token) 
        external 
        nonReentrant 
        validToken(_token) 
    {
        require(_amount > 0, "Amount must be greater than 0");
        require(escrowBalance[msg.sender][_token] >= _amount, "Insufficient balance");
        
        escrowBalance[msg.sender][_token] -= _amount;
        sellerData[msg.sender].totalWithdrawn += _amount;
        
        if (_token == address(0)) {
            (bool success, ) = msg.sender.call{value: _amount}("");
            require(success, "Withdrawal failed");
        } else {
            IERC20 token = IERC20(_token);
            require(token.transfer(msg.sender, _amount), "Token transfer failed");
        }
        
        emit FundsWithdrawn(msg.sender, _amount, _token);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Updates platform fee percentage (in basis points)
     * @param _newFeePercentage New fee percentage (e.g., 250 for 2.5%)
     */
    function setPlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _newFeePercentage;
        emit PlatformFeeUpdated(_newFeePercentage);
    }
    
    /**
     * @dev Adds a new supported payment token
     * @param _token Address of the token
     */
    function addSupportedToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedTokens[_token] = true;
        emit TokenAdded(_token);
    }
    
    /**
     * @dev Updates dispute resolution window
     * @param _newWindow New window in seconds
     */
    function setDisputeResolutionWindow(uint256 _newWindow) external onlyOwner {
        require(_newWindow > 0, "Invalid window");
        disputeResolutionWindow = _newWindow;
    }
    
    /**
     * @dev Withdraws platform fees
     * @param _amount Amount to withdraw
     * @param _token Token to withdraw
     */
    function withdrawPlatformFees(uint256 _amount, address _token) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(_amount > 0 && _amount <= platformBalance, "Invalid amount");
        
        platformBalance -= _amount;
        
        if (_token == address(0)) {
            (bool success, ) = owner().call{value: _amount}("");
            require(success, "Withdrawal failed");
        } else {
            IERC20 token = IERC20(_token);
            require(token.transfer(owner(), _amount), "Token transfer failed");
        }
    }
    
    /**
     * @dev Pauses the marketplace
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Gets seller escrow balance for a token
     */
    function getSellerBalance(address _seller, address _token) external view returns (uint256) {
        return escrowBalance[_seller][_token];
    }
    
    /**
     * @dev Gets seller data
     */
    function getSellerData(address _seller) external view returns (SellerEscrow memory) {
        return sellerData[_seller];
    }
    
    /**
     * @dev Gets listing details
     */
    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }
    
    /**
     * @dev Gets order details
     */
    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
    
    /**
     * @dev Receives native currency
     */
    receive() external payable {}
}
