// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ICurve {

    function exchange(int128 i,int128 j,uint256 dx,uint256 dy) external;
}

contract Curve{

    using SafeERC20 for IERC20;

    // address public router = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address public pool = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7;
    address public usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    bytes public addressEncoded;
    
    function swap() public {

        // address[] memory poolsPath =  new address[](1);
        // poolsPath[0] = 0x306121f1344ac5F84760998484c0176d7BFB7134;
        address[] memory path =  new address[](2);
        path[0] = usdc;
        path[1] = dai;
        // _approveToken(usdc,pool,20000000);
        _approveToken(usdc,pool,20000000);
        ICurve(pool).exchange(1,0,
        10000000,
        1000000000000000000);
        
    }

    function encode() public {
        address[] memory path =  new address[](2);
        path[0] = usdc;
        path[1] = dai;
        // _approveToken(usdc,pool,20000000);
        _approveToken(usdc,pool,20000000);

        addressEncoded = abi.encodeWithSignature("exchange(int128,int128,uint256,uint256)",1,0,10000000,1000000000000000000);

    }

    function encodedSwap(bytes memory data) public {
        (bool result, ) = pool.call(data);
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