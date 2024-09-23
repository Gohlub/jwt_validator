# zkfetch example

This is an example project that demonstrates how to use zk-fetch on an Express.js server. We will send a JWT token to Google API for validation and then we will generate a zk-fetch proof for the response.

- Return fields will also include a transformed proof that can be used on-chain for verification.

## To run the project

1. Install dependencies:
    ```bash
    npm install
    ```

2. Set the `APP_ID` and `APP_SECRET` in the `.env` file you need to create: 

    ```bash
    APP_ID=your_app_id
    APP_SECRET=your_app_secret
    PORT=8080
    ```

    You can get your `APP_ID` and `APP_SECRET` from [Reclaim Protocol Developer Portal](https://dev.reclaimprotocol.org).
    - go to the [Reclaim Protocol Developer Portal](https://dev.reclaimprotocol.org)
    - create a new public data (zkfetch) application and get the `APP_ID` and `APP_SECRET` from the application

## Usage

To start the server, run:
    ```bash
    npm start
    ```

    The server will start running on `http://localhost:8080`.

## Endpoints


### GET /generateProof

- **Description**: Generates a proof of the validity of a JWT token from Google API.
- **Response**: Returns both the raw proof and the transformed proof for on-chain use.

Example response:
![Example response](https://i.imgur.com/olZHLHB.png)

