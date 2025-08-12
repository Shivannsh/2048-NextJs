import axios from "axios";
import { Buffer } from "buffer";
import fs from "fs";
import path from "path";

const API_URL = "https://relayer-api.horizenlabs.io/api/v1";
const vkey = JSON.parse(fs.readFileSync(path.join(process.cwd(), "circuit_2048", "vkey.json"), "utf8"));

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !body.proof) {
      return new Response(
        JSON.stringify({ error: "Missing proof in request body" }),
        { status: 400 }
      );
    }

    // console.log(body);

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
      });
    }
    try {
      const proofUint8 = new Uint8Array(Object.values(body.proof));

      const params = {
        proofType: "ultraplonk",
        vkRegistered: true,
        proofOptions: {
          numberOfPublicInputs: 2,
        },
        proofData: {
          proof: Buffer.from(
            concatenatePublicInputsAndProof(body.publicInputs, proofUint8)
          ).toString("base64"),
          vk: vkey.hash,
        },
      };
      // console.log(params);

      const requestResponse = await axios.post(
        `${API_URL}/submit-proof/${process.env.NEXT_PUBLIC_API_KEY}`,
        params
      );
      // console.log(requestResponse.data);

      if (requestResponse.data.optimisticVerify != "success") {
        console.error("Proof verification, check proof artifacts");
        return;
      }

      while (true) {
        try {
          const jobStatusResponse = await axios.get(
            `${API_URL}/job-status/${process.env.NEXT_PUBLIC_API_KEY}/${requestResponse.data.jobId}`
          );
          // console.log("Job Status: ", jobStatusResponse.data);
          if (jobStatusResponse.data.status === "IncludedInBlock") {
            // console.log("Job Included in Block successfully");
            return new Response(JSON.stringify(jobStatusResponse.data), {
              status: 200,
            });
          } else {
            // console.log("Job status: ", jobStatusResponse.data.status);
            // console.log("Waiting for job to finalize...");
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
          }
        } catch (error: any) {
          if (error.response.status === 503) {
            // console.log("Service Unavailable, retrying...");
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
          }
        }
      }
    } catch (error) {
      console.log(error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

function hexToUint8Array(hex: any) {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  if (hex.length % 2 !== 0) hex = "0" + hex;

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function concatenatePublicInputsAndProof(
  publicInputsHex: any,
  proofUint8: any
) {
  const publicInputBytesArray = publicInputsHex.flatMap((hex: any) =>
    Array.from(hexToUint8Array(hex))
  );

  const publicInputBytes = new Uint8Array(publicInputBytesArray);

  const newProof = new Uint8Array(publicInputBytes.length + proofUint8.length);
  newProof.set(publicInputBytes, 0);
  newProof.set(proofUint8, publicInputBytes.length);

  return newProof;
}

