// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IRouter{
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata poolsPath,
        IERC20[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

//swap usdc to get usdt
//addressEncoded works
contract Kyber{

    using SafeERC20 for IERC20;

    address public router = 0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6;
    address public pool = 0x306121f1344ac5F84760998484c0176d7BFB7134;
    address public usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public usdt = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    bytes  public addressIERC20Encoded;
    bytes  public ierc20Encoded;
    bytes  public addressEncoded;
    
    function swap() public returns (uint256[] memory amounts) {

        address[] memory poolsPath =  new address[](1);
        poolsPath[0] = 0x306121f1344ac5F84760998484c0176d7BFB7134;
        IERC20[] memory path =  new IERC20[](2);
        path[0] = IERC20(usdc);
        path[1] = IERC20(usdt);
        _approveToken(usdc,pool,20000000);
        _approveToken(usdc,router,20000000);
        return IRouter(router).swapExactTokensForTokens(10000000,1000000,
        poolsPath,
        path,
        address(this),1646256514);
        
    }

    function encoded() public {
        address[] memory poolsPath =  new address[](1);
        poolsPath[0] = 1000000;
        IERC20[] memory path =  new IERC20[](2);
        path[0] = IERC20(usdc);
        path[1] = IERC20(usdt);
        address[] memory pathNew = new address[](2);
        pathNew[0] = usdc;
        pathNew[1] = usdt;
        _approveToken(usdc,pool,20000000);
        _approveToken(usdc,router,20000000);


        addressIERC20Encoded = abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address[],address,uint256)",10000000,1000000,poolsPath,path,address(this),1646256514);
        ierc20Encoded = abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],IERC20[],address,uint256)",10000000,1000000,poolsPath,path,address(this),1646256514);
        addressEncoded = abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address[],address,uint256)",10000000,1000000,poolsPath,pathNew,address(this),1646256514);


    }

    function encodeSwap(bytes memory data) public {
        (bool result, ) = router.call(data);
        if(!result){
            revert("Transaction failed");
        }
    }

    function balance() public view returns(uint256,uint256){
        uint256 usdcBal = IERC20(usdc).balanceOf(address(this));
        uint256 usdtBal = IERC20(usdt).balanceOf(address(this));
        return (usdcBal,usdtBal);
    }

    function _approveToken(
        address _token,
        address _spender,
        uint256 _amount
    ) internal {
        if (IERC20(_token).allowance((address(this)), _spender) > 0) {
            IERC20(_token).safeApprove(_spender, 0);
            IERC20(_token).safeApprove(_spender, _amount);
        } else {IERC20(_token).safeApprove(_spender, _amount);}
    }
}