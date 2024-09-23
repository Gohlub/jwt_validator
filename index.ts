import express, { Request, Response } from 'express';
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';
import { Reclaim } from '@reclaimprotocol/js-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the ReclaimClient with the app id and app secret (you can get these from the Reclaim dashboard - https://dev.reclaimprotocol.org/) 
const reclaimClient = new ReclaimClient(process.env.APP_ID!, process.env.APP_SECRET!);
const app = express();


app.get('/', (_: Request, res: Response) => {
    res.send('Running');
});
app.get('/generateProof/:idToken', async (req: Request, res: Response) => {
    try{
        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${req.params.idToken}`;

        // Request zkfetch proof (the proof will be generated with the response body)
        const proof = await reclaimClient.zkFetch(url, {
          method: 'GET',
        }, {
          responseMatches: [
            {
                "type": "regex",
                "value": ".*" // This regex will match any string
            }
          ],
        });
      
        if(!proof) {
          return res.status(400).send('Failed to generate proof');
        }
        // Verify the proof
        const isValid = await Reclaim.verifySignedProof(proof);
        if(!isValid) {
          return res.status(400).send('Proof is invalid');
        }
        // Transform the proof data to be used on-chain (for the contract)
        // The transformed proof is the proof data that will be used on-chain (for verification)
        const proofData = await Reclaim.transformForOnchain(proof);
        return res.status(200).json({ transformedProof: proofData, proof });
    }
    catch(e){
        console.log(e);
        return res.status(500).send(e);
    }
})



const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});