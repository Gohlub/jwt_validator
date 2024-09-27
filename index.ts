import express, { Request, Response } from "express";
import { ReclaimClient } from "@reclaimprotocol/zk-fetch";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import dotenv from "dotenv";
dotenv.config();

// Initialize the ReclaimClient with the app id and app secret (you can get these from the Reclaim dashboard - https://dev.reclaimprotocol.org/)
const reclaimClient = new ReclaimClient(
  process.env.APP_ID!,
  process.env.APP_SECRET!
);
const app = express();
let authorization_code;

app.get("/", (_: Request, res: Response) => {
  res.send("Running");
});
app.get("/OAuthRequest", async (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(2);
  const redirect_uri = "http://localhost:8080/accessTokenRequest";
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${redirect_uri}&scope=openid%20email%20profile&state=${state}`;
  res.redirect(oauthUrl);
});
app.get("/accessTokenRequest", async (req: Request, res: Response) => {
  authorization_code = req.query.code as string;

  if (!authorization_code) {
    res.status(400).send("Missing 'code' parameter");
    return;
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const body = `code=${encodeURIComponent(
    authorization_code
  )}&client_id=${encodeURIComponent(
    process.env.CLIENT_ID!
  )}&client_secret=${encodeURIComponent(
    process.env.CLIENT_SECRET!
  )}&redirect_uri=${encodeURIComponent(
    "http://localhost:8080/accessTokenRequest"
  )}&grant_type=authorization_code`;

  try {
    const proof = await reclaimClient.zkFetch(
      tokenUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          userop: "whole fricking user op",
        },
        body: body,
      },
      {
        responseMatches: [
          {
            type: "regex",
            value: ".*", // This regex will match any string
          },
        ],
      }
    );

    if (!proof) {
      return res.status(400).send("Failed to generate proof");
    }
    // Verify the proof
    const isValid = await Reclaim.verifySignedProof(proof);
    if (!isValid) {
      return res.status(400).send("Proof is invalid");
    }
    // Transform the proof data to be used on-chain (for the contract)
    // The transformed proof is the proof data that will be used on-chain (for verification)
    const proofData = await Reclaim.transformForOnchain(proof);
    return res.status(200).json({ proof, proofData });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

app.get("/generateProof/:idToken", async (req: Request, res: Response) => {});

const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
