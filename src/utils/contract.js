import { ethers } from "ethers";
import contractAbiEth from "../../abi/Eth.json";
import contractAbiScr from "../../abi/Scr.json";

const contractAddressEth = "0xYourDeployedContract";
const contractAddressScr = "0xYourDeployedContract";


export async function getContract(chain = ""){
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	await provider.send("eth_requestAccounts", []);
	const signer = provider.getSigner();

	if (chain == "ETH")
		return new ethers.Contract(contractAddressEth, contractAbiEth, signer);
	else
		return new ethers.Contract(contractAddressScr, contractAbiScr, signer);

}
