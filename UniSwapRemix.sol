// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IRouter{
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external payable returns (uint256 amountOut);
}

contract UniSwap{

    using SafeERC20 for IERC20;

    address public router = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
    address public pool = 0xAaF5110db6e744ff70fB339DE037B990A20bdace;
    address public usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    bytes public addressEncoded;
    bytes public addressUint256Encoded;
    bytes public addressDummyEncoded;

    function swap() public returns (uint256 amount) {

        // address[] memory poolsPath =  new address[](1);
        // poolsPath[0] = 0x306121f1344ac5F84760998484c0176d7BFB7134;
        address[] memory path =  new address[](2);
        path[0] = usdc;
        path[1] = dai;
        // _approveToken(usdc,pool,20000000);
        _approveToken(usdc,router,20000000);
        return IRouter(router).swapExactTokensForTokens(10000000,1000000000000000000,
        path,
        address(this));
        
    }

    function encoded() public {
        address[] memory path =  new address[](2);
        path[0] = usdc;
        path[1] = dai;
        // _approveToken(usdc,pool,20000000);
        _approveToken(usdc,router,20000000);

        // addressEncoded = abi.encodeWithSignature("swapExactTokensForTokens(uint,uint,address[],address,uint)",10000000,1000000000000000000,path,address(this),1646346489);
        addressUint256Encoded = abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address)",10000000,1000000000000000000,path,address(this));
        // addressDummyEncoded = abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",10000000,1000000000000000000,path,"0xed4676ad9A0Cf24d2e504C2e3DAD23B836DE455e",1646346489);


    }

    function encodeSwap(bytes memory data) public {
        (bool result, ) = router.call(data);
        if(!result){
            revert("Transaction failed");
        }
    }

    function balance() public view returns(uint256,uint256){
        uint256 usdcBal = IERC20(usdc).balanceOf(address(this));
        uint256 usdtBal = IERC20(dai).balanceOf(address(this));
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