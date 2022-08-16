const { PublicKey } = require('@solana/web3.js');


function Valication(address) {
    try {
        const publicKeyInUint8 = new PublicKey(address).toBytes();
        let  isSolana =  PublicKey.isOnCurve(publicKeyInUint8)
        return isSolana
    } catch (error) {
        return false
    }
}

const aaa = Valication("3r1PGz75M2xejHxivpa8Z9mGgNiRon7cL1jfDDYKEGoD")
console.log(aaa)