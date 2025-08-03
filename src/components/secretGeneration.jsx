import { ethers } from 'ethers';
import MerkleTree, { MerkleTree} from 'merkletreejs'
import { useLayoutEffect } from 'react';

export function generateMerkleSecrets(nbrOfchanks){
    const secrets = [];
    const leaves = [];
    for(let i = 0; i < nbrOfchanks; i++){
        const secret = ethers.hexlify(ethers.randomBytes(32));
        const hash = ethers.keccak256(secret);
        secrets.push(secret);
        leaves.push(hash);
    }
    const tree = new MerkleTree(leaves, ethers.keccak256, {sortPairs: true});
    const root = tree.getHexRoot();
    const proofs = leaves.map(leaf => tree.getHexProof(leaf));

    localStorage.setItem("secrets", JSON.stringify(secrets));
    localStorage.setItem("leaves", JSON.stringify(leaves));
    localStorage.setItem("root", root);
    localStorage.setItem("proofs", JSON.stringify(leaves));
    
    return (root, secrets, leaves, tree, proofs)
}

// export default generateSecret;