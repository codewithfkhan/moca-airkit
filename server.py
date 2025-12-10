from flask import Flask, jsonify, request
import os
from cryptography.hazmat.primitives import serialization
from base64 import urlsafe_b64encode

app = Flask(__name__)

# 1. Configure fixed parameters (provided by the other party)
TARGET_KID = "6386cb4d-c0de-4629-a412-8dcf6f50f805"  # Fixed kid
PARTNER_PUBLIC_KEY_PATH = "partner_public.pem"  # Public key corresponding to the other party's private key
PARTNER_PRIVATE_KEY_PATH = "partner_private.key"  # Private key provided by the other party
REQUIRED_PAYLOAD = {  # Fixed Payload format
    "partnerId": "8b5773b4-adea-487c-bcec-f362e8b285bf",
    "scope": "issue verify"
}

# 2. 工具函数：将RSA公钥转换为JWK格式
def int_to_base64url(num):
    """Convert integer to Base64URL encoding required by JWK (without padding)"""
    bytes_data = num.to_bytes((num.bit_length() + 7) // 8, byteorder="big", signed=False)
    return urlsafe_b64encode(bytes_data).decode("utf-8").replace("=", "")

def load_public_key_as_jwk():
    """Load the other party's public key and generate JWK with specified kid"""
    with open(PARTNER_PUBLIC_KEY_PATH, "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())
    rsa_numbers = public_key.public_numbers()
    return {
        "kty": "RSA",
        "alg": "RS256",
        "use": "sig",
        "kid": TARGET_KID,
        "n": int_to_base64url(rsa_numbers.n),  # # Public key modulus
        "e": int_to_base64url(rsa_numbers.e)   # Public key exponent
    }

# 3. Construct JWKS (JSON Web Key Set)）
jwk = load_public_key_as_jwk()
jwks = {"keys": [jwk]}

# 4. Expose JWKS endpoint (for the other party to obtain public key when verifying JWT signature)
@app.route("/jwks", methods=["GET"])
def get_jwks():
    return jsonify(jwks)

# 5. Generate JWT that meets requirements (signed with the other party's private key)
@app.route("/generate-valid-jwt", methods=["GET"])
def generate_valid_jwt():
    import jwt
    with open(PARTNER_PRIVATE_KEY_PATH, "rb") as f:
        private_key = f.read()
    # 用Generate JWT with payload and kid required by the other party
    token = jwt.encode(
        REQUIRED_PAYLOAD,
        private_key,
        algorithm="RS256",
        headers={"kid": TARGET_KID}
    )
    return jsonify({
        "jwt": token,
        "payload": REQUIRED_PAYLOAD,
        "kid": TARGET_KID,
        "algorithm": "RS256"
    })

# 6. (Optional) JWT verification endpoint (for testing)
@app.route("/verify-jwt", methods=["POST"])
def verify_jwt():
    import jwt
    token = request.json.get("token")
    if not token:
        return jsonify({"error": "请提供JWT"}), 400
    try:
        with open(PARTNER_PUBLIC_KEY_PATH, "rb") as f:
            public_key = f.read()
        # Verify signature, algorithm, and kid
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_kid": True}
        )
        return jsonify({
            "valid": True,
            "payload": payload,
            "message": "JWT验证通过"
        })
    except jwt.ExpiredSignatureError:
        return jsonify({"valid": False, "error": "JWT已过期"}), 400
    except jwt.InvalidSignatureError:
        return jsonify({"valid": False, "error": "签名无效"}), 400
    except jwt.InvalidKidError:
        return jsonify({"valid": False, "error": "kid不匹配"}), 400
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 400

if __name__ == "__main__":
    # Start the service (use your available port)
    app.run(host="0.0.0.0", port=80, debug=True)