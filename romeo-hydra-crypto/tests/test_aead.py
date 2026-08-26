import unittest

from cryptography.exceptions import InvalidTag

from core.aead import (
    KEY_SIZE,
    NONCE_SIZE,
    decrypt,
    encrypt,
    generate_key,
)


class TestAEAD(unittest.TestCase):

    def test_round_trip(self):
        key = generate_key()
        plaintext = b"ROMEO-HYDRA event payload"

        nonce, ciphertext = encrypt(key, plaintext)
        recovered = decrypt(key, nonce, ciphertext)

        self.assertEqual(recovered, plaintext)
        self.assertEqual(len(key), KEY_SIZE)
        self.assertEqual(len(nonce), NONCE_SIZE)

    def test_random_nonce(self):
        key = generate_key()
        plaintext = b"same plaintext"

        nonce1, ciphertext1 = encrypt(key, plaintext)
        nonce2, ciphertext2 = encrypt(key, plaintext)

        self.assertNotEqual(nonce1, nonce2)
        self.assertNotEqual(ciphertext1, ciphertext2)

    def test_aad_authentication(self):
        key = generate_key()
        plaintext = b"payload"
        aad = b"event-id:123"

        nonce, ciphertext = encrypt(
            key,
            plaintext,
            aad,
        )

        recovered = decrypt(
            key,
            nonce,
            ciphertext,
            aad,
        )

        self.assertEqual(recovered, plaintext)

    def test_wrong_aad_rejected(self):
        key = generate_key()
        plaintext = b"payload"

        nonce, ciphertext = encrypt(
            key,
            plaintext,
            b"correct-aad",
        )

        with self.assertRaises(InvalidTag):
            decrypt(
                key,
                nonce,
                ciphertext,
                b"wrong-aad",
            )

    def test_modified_ciphertext_rejected(self):
        key = generate_key()
        plaintext = b"payload"

        nonce, ciphertext = encrypt(key, plaintext)

        corrupted = bytearray(ciphertext)
        corrupted[0] ^= 0x01

        with self.assertRaises(InvalidTag):
            decrypt(
                key,
                nonce,
                bytes(corrupted),
            )

    def test_wrong_key_rejected(self):
        key = generate_key()
        wrong_key = generate_key()

        nonce, ciphertext = encrypt(
            key,
            b"secret",
        )

        with self.assertRaises(InvalidTag):
            decrypt(
                wrong_key,
                nonce,
                ciphertext,
            )

    def test_invalid_key_size(self):
        with self.assertRaises(ValueError):
            encrypt(
                b"short-key",
                b"payload",
            )

    def test_invalid_nonce_size(self):
        key = generate_key()

        with self.assertRaises(ValueError):
            decrypt(
                key,
                b"short",
                b"ciphertext",
            )


if __name__ == "__main__":
    unittest.main()
