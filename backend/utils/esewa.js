import axios from "axios";
import crypto from 'crypto';
import { ESEWA_PRODUCT_CODE, ESEWA_GATEWAY_URL, ESEWA_SECRET_KEY } from "../config/env.js";

export const esewaPaymentHash = async function getEsewaPaymentHash({ amount, transaction_uuid }) {
  try {
    const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;

    const secretKey = ESEWA_SECRET_KEY;
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    return {
      signature: hash,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };
  } catch (error) {
    throw error;
  }
}

export const verifyEsewa = async function verifyEsewaPayment(encodedData) {
  try {
    let decodedData = Buffer.from(encodedData, "base64").toString("utf8");
    decodedData = JSON.parse(decodedData);

    let headersList = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${ESEWA_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;

    const secretKey =ESEWA_SECRET_KEY;
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    if (hash !== decodedData.signature) {
      throw { message: "Invalid signature", decodedData };
    }

    let reqOptions = {
      url: `${ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
      method: "GET",
      headers: headersList,
    };

    let response = await axios.request(reqOptions);

    if (
      response.data.status !== "COMPLETE" ||
      response.data.transaction_uuid !== decodedData.transaction_uuid ||
      Number(response.data.total_amount) !== Number(decodedData.total_amount)
    ) {
      throw { message: "Invalid transaction details", decodedData };
    }

    return { response: response.data, decodedData };
  } catch (error) {
    throw error;
  }
}
