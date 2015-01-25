document.getElementById("buttons").style.visibility = "visible";

var to_hex = sodium.to_hex;
var from_hex = sodium.from_hex;

function curve25519Test() {
	var sArray = [sodium.crypto_scalarmult, sodium.crypto_scalarmult_base];
	if (!checkAvailability(sArray)) {
		return 'Curve25519 (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	log("scalarmult_SCALARBYTES: " + sodium.crypto_scalarmult_SCALARBYTES);
	log("scalarmult_BYTES: " + sodium.crypto_scalarmult_BYTES);

	var c25519scalar1 = randBuffer(sodium.crypto_scalarmult_SCALARBYTES);
	var c25519publicKey1 = sodium.crypto_scalarmult_base(c25519scalar1);
	log("Private key 1:&nbsp;" + to_hex(c25519scalar1));
	log("Pubkey 1:&nbsp;" + to_hex(c25519publicKey1));

	var c25519scalar2 = randBuffer(sodium.crypto_scalarmult_SCALARBYTES);
	var c25519publicKey2 = sodium.crypto_scalarmult_base(c25519scalar2);
	log("Private key 2:&nbsp;" + to_hex(c25519scalar2));
	log("Pubkey 2:&nbsp;" + to_hex(c25519publicKey2));

	var sharedSecret1 = sodium.crypto_scalarmult(c25519scalar2, c25519publicKey1);
	log("Shared secret 1:&nbsp;" + to_hex(sharedSecret1));

	var sharedSecret2 = sodium.crypto_scalarmult(c25519scalar1, c25519publicKey2);
	log("Shared secret 2:&nbsp;" + to_hex(sharedSecret2));
	log("Is it a shared secret? :&nbsp;" + (to_hex(sharedSecret1) == to_hex(sharedSecret2)));

	try {
		sodium_test.scalarmult();
		log("Vectors tests completed with success");
	} catch (e) {
		log(e.message);
	}
	return logStr;
}

function ed25519Test() {
	var sArray = [sodium.crypto_sign_seed_keypair, sodium.crypto_sign, sodium.crypto_sign_detached, sodium.crypto_sign_open, sodium.crypto_sign_verify_detached];
	if (!checkAvailability(sArray)) {
		return 'Ed25519 (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var ed25519seed = randBuffer(sodium.crypto_sign_SEEDBYTES);
	var ed25519keypair = sodium.crypto_sign_seed_keypair(ed25519seed, "hex");
	var msg = "Message";
	log("Message to be signed: " + msg);
	log("Ed25519 seed: " + sodium.to_hex(ed25519seed));
	log("Ed25519 keypair: " + JSON.stringify(ed25519keypair));

	var ed25519signature = sodium.crypto_sign(msg, from_hex(ed25519keypair.privateKey));
	log("Ed25519 signature: " + to_hex(ed25519signature));

	var ed25519signature_detached = sodium.crypto_sign_detached(msg, from_hex(ed25519keypair.privateKey));
	log("Ed25519 detached signature: <br>" + to_hex(ed25519signature_detached));

	var verifySign1 = sodium.crypto_sign_open(ed25519signature, from_hex(ed25519keypair.publicKey));
	log("Signed message: " + to_hex(verifySign1));

	var verifySign2 = sodium.crypto_sign_verify_detached(ed25519signature_detached, msg, from_hex(ed25519keypair.publicKey));
	log("Detached signature is valid? " + verifySign2);

	sodium_test.sign(function (e, proportion) {
		if (e) {
			message.innerHTML += e + "<br>";
		} else {
			message.innerHTML += proportion.tested + " out of " + proportion.count + " Ed25519 vectors have been tested. All passed with success<br>";
		}
	});
	return logStr;
}

function test25519() {
	var sArray = [sodium.crypto_sign_ed25519_pk_to_curve25519, sodium.crypto_sign_ed25519_sk_to_curve25519];
	if (!checkAvailability(sArray)) {
		return 'Ed25519 -> Curve25519 transformation (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var ed25519seed1 = randBuffer(sodium.crypto_sign_SEEDBYTES);
	var ed25519seed2 = randBuffer(sodium.crypto_sign_SEEDBYTES);
	var ed25519keypair1 = sodium.crypto_sign_seed_keypair(ed25519seed1, "hex");
	var ed25519keypair2 = sodium.crypto_sign_seed_keypair(ed25519seed2, "hex");
	log("Ed25519 keypair 1 : " + JSON.stringify(ed25519keypair1));
	log("Ed25519 keypair 2 : " + JSON.stringify(ed25519keypair2));

	var curve25519keypair1 = {
		publicKey: sodium.crypto_sign_ed25519_pk_to_curve25519(from_hex(ed25519keypair1.publicKey)),
		privateKey: sodium.crypto_sign_ed25519_sk_to_curve25519(from_hex(ed25519keypair1.privateKey))
	};
	var curve25519keypair2 = {
		publicKey: sodium.crypto_sign_ed25519_pk_to_curve25519(from_hex(ed25519keypair2.publicKey)),
		privateKey: sodium.crypto_sign_ed25519_sk_to_curve25519(from_hex(ed25519keypair2.privateKey))
	};
	var sharedSecret1 = sodium.crypto_scalarmult(curve25519keypair1.privateKey, curve25519keypair2.publicKey);
	log("Shared secret 1: " + to_hex(sharedSecret1));

	var sharedSecret2 = sodium.crypto_scalarmult(curve25519keypair2.privateKey, curve25519keypair1.publicKey);
	log("Shared secret 2: " + to_hex(sharedSecret2));
	log("Are shared secrets equal: " + (to_hex(sharedSecret1) == to_hex(sharedSecret2)));

	return logStr;
}

function testCryptoBox() {
	var sArray = [sodium.crypto_box_seed_keypair, sodium.crypto_box_easy, sodium.crypto_box_open_easy, sodium.crypto_box_detached, sodium.crypto_box_open_detached];
	if (!checkAvailability(sArray)) {
		return 'CryptoBox (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var nonce = randBuffer(sodium.crypto_box_NONCEBYTES);
	log("Nonce: " + to_hex(nonce));

	var seed1 = randBuffer(sodium.crypto_box_SEEDBYTES);
	var seed2 = randBuffer(sodium.crypto_box_SEEDBYTES);
	log("Seed 1: " + to_hex(seed1));
	log("Seed 2: " + to_hex(seed2));

	var keyPair1 = sodium.crypto_box_seed_keypair(seed1, "hex");
	var keyPair2 = sodium.crypto_box_seed_keypair(seed2, "hex");
	log("Keypair 1: " + JSON.stringify(keyPair1));
	log("Keypair 2: " + JSON.stringify(keyPair2));

	var message = "Crypto box testing";
	var ciphertext1 = sodium.crypto_box_easy(message, nonce, from_hex(keyPair1.publicKey), from_hex(keyPair2.privateKey));
	var ciphertext2 = sodium.crypto_box_easy(message, nonce, from_hex(keyPair2.publicKey), from_hex(keyPair1.privateKey));
	log("ciphertext: " + to_hex(ciphertext1));
	log("Ciphertexts are equal: " + (ciphertext1 === ciphertext2));

	var plaintext1 = sodium.crypto_box_open_easy(ciphertext1, nonce, from_hex(keyPair2.publicKey), from_hex(keyPair1.privateKey), "text");
	var plaintext2 = sodium.crypto_box_open_easy(ciphertext2, nonce, from_hex(keyPair1.publicKey), from_hex(keyPair2.privateKey), "text");
	log("plaintext: " + plaintext1);
	log("Are plaintexts equal: " + (plaintext1 === plaintext2));

	log("DETACHED TESTING");

	var detachedCipher1 = sodium.crypto_box_detached(message, nonce, from_hex(keyPair1.publicKey), from_hex(keyPair2.privateKey), "hex");
	log("Detached cipher 1:<br>" + JSON.stringify(detachedCipher1));

	var detachedCipher2 = sodium.crypto_box_detached(message, nonce, from_hex(keyPair2.publicKey), from_hex(keyPair1.privateKey), "hex");
	log("Detached cipher 2:<br>" + JSON.stringify(detachedCipher2));

	plaintext1 = sodium.crypto_box_open_detached(from_hex(detachedCipher1.ciphertext), from_hex(detachedCipher1.mac), nonce, from_hex(keyPair1.publicKey), from_hex(keyPair2.privateKey), "text");
	plaintext2 = sodium.crypto_box_open_detached(from_hex(detachedCipher2.ciphertext), from_hex(detachedCipher2.mac), nonce, from_hex(keyPair2.publicKey), from_hex(keyPair1.privateKey), "text");
	log("plaintext: " + plaintext1);
	log("Are plaintexts equal: " + (plaintext1 === plaintext2));

	return logStr;
}

function testCryptoSecretBox() {
	var sArray = [sodium.crypto_secretbox_easy, sodium.crypto_secretbox_open_easy];
	if (!checkAvailability(sArray)) {
		return 'Curve25519 (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var nonce = randBuffer(sodium.crypto_secretbox_NONCEBYTES);
	log("Nonce: " + to_hex(nonce));

	var key = randBuffer(sodium.crypto_secretbox_KEYBYTES);
	log("Key: " + to_hex(key));

	var message = "Crypto Secretbox testing";
	var cipher = sodium.crypto_secretbox_easy(message, nonce, key);
	log("Ciphertext: " + to_hex(cipher));

	var plaintext = sodium.crypto_secretbox_open_easy(cipher, nonce, key, "text");
	log("plaintext: " + plaintext);
	log("plaintext and initial message are equal: " + (plaintext === message));

	sodium_test.secretbox_easy();
	log("Test vectors passed with success");

	return logStr;
}

function testHash() {
	var sArray = [sodium.crypto_hash];
	if (!checkAvailability(sArray)) {
		return 'Hash (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var message = "message";
	log("Message to hash: " + message);

	var hash = sodium.crypto_hash(message);
	log("Hash: " + to_hex(hash));

	try {
		sodium_test.hash();
		log("Test vectors passed with success");
	} catch (e) {
		log(e.message);
	}
	return logStr;
}

function testHmac() {
	var sArray = [sodium.crypto_auth, sodium.crypto_auth_verify];
	if (!checkAvailability(sArray)) {
		return 'CryptoAuth (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var message = "Message to be signed";
	log('Message: "' + message + '"');

	var hmacKey = randBuffer(sodium.crypto_auth_KEYBYTES);
	log("HMAC key: " + to_hex(hmacKey));

	var tag = sodium.crypto_auth(message, hmacKey);
	log("HMAC tag: " + to_hex(tag));

	var isValidTag = sodium.crypto_auth_verify(tag, message, hmacKey);
	log("HMAC is valid: " + (isValidTag ? "yes" : "no"));
	log("Test vectors passed with success");

	return logStr;
}

function testScrypt() {
	var sArray = [sodium.crypto_pwhash_scryptsalsa208sha256_ll];
	if (!checkAvailability(sArray)) {
		return 'Scrypt (or parts of it) is missing from the js-compiled libsodium.<br>Please add the missing symbols to the "EXPORTED_FUNCTIONS" array in emscripten.sh, then run `make clean` and `make`';
	}
	var logStr = "";

	function log(s) {
		logStr += s + "<br>";
	}

	var password = "password";
	var salt = randBuffer(8);
	log("Salt: " + sodium.to_hex(salt));

	var r = 8,
		p = 1,
		opsLimit = 16384,
		keySize = 32;
	log("r = " + r + ", p = " + p + ", opsLimit = " + opsLimit + ", keySize = " + keySize);

	var derivedKey = sodium.crypto_pwhash_scryptsalsa208sha256_ll(password, salt, opsLimit, r, p, keySize, "hex");
	log("Derived key: " + derivedKey);

	try {
		sodium_test.scrypt();
		log("Vectors tests completed with success");
	} catch (e) {
		log(e.message);
	}
	return logStr;
}

function randBuffer(size) {
	var b = new Uint8Array(size);
	window.crypto.getRandomValues(b);
	return b;
}

function strBuffer(b) {
	var bufStr = "[";
	for (var i = 0; i < b.length; i++) {
		bufStr += b[i];
		if (i != b.length - 1) bufStr += ", ";
	}
	bufStr += "]";
	return bufStr;
}

function checkAvailability(symbolArray) {
	if (!Array.isArray(symbolArray)) {
		 throw new TypeError("symbolArray must be an array");
	}
	var andAll = true;
	symbolArray.forEach(function (e) {
		andAll = andAll && e;
	});
	return andAll;
}
