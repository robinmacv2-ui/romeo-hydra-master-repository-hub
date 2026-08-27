import unittest

from core.aead import decrypt, encrypt, generate_key
from core.envelope import (
    COMMITMENT_HEX_LENGTH,
    CURRENT_VERSION,
    deserialize,
    seal,
    serialize,
    verify,
)
from core.pedersen import P, Q


class TestEnvelopeFull(unittest.TestCase):

    def setUp(self):
        self.key = generate_key()
        self.plaintext = (
            b"ROMEO-HYDRA canonical transaction payload"
        )
        self.aad = b"audit-context:session-99"

        self.nonce, self.ciphertext = encrypt(
            self.key,
            self.plaintext,
            self.aad,
        )

        self.event_id = "evt-2026-08-26-001"

    def _seal(self, event_id=None):
        return seal(
            event_id if event_id is not None else self.event_id,
            self.nonce,
            self.ciphertext,
            self.aad,
        )

    # ---------------------------------------------------------
    # BASIC ROUND TRIP
    # ---------------------------------------------------------

    def test_round_trip(self):
        env, r = self._seal()

        self.assertTrue(
            verify(env, r=r)
        )

    def test_serialize_deserialize_round_trip(self):
        env, r = self._seal()

        serialized = serialize(env)
        recovered = deserialize(serialized)

        self.assertEqual(
            env,
            recovered,
        )

        self.assertTrue(
            verify(recovered, r=r)
        )

    # ---------------------------------------------------------
    # CANONICAL SERIALIZATION
    # ---------------------------------------------------------

    def test_deterministic_canonical_serialization(self):
        """
        serialize() debe ser determinista para un mismo envelope.

        IMPORTANTE:
        No se comparan dos llamadas independientes a seal(),
        porque Pedersen utiliza randomness criptográfica.
        """
        env, _ = self._seal()

        serialized_1 = serialize(env)
        serialized_2 = serialize(env)

        self.assertIsInstance(
            serialized_1,
            str,
        )

        self.assertEqual(
            serialized_1,
            serialized_2,
        )

    def test_canonical_serialization_is_stable_after_deserialize(self):
        env, _ = self._seal()

        serialized_1 = serialize(env)
        recovered = deserialize(serialized_1)
        serialized_2 = serialize(recovered)

        self.assertEqual(
            serialized_1,
            serialized_2,
        )

    def test_same_inputs_preserve_nonrandom_fields(self):
        """
        Dos seals independientes deben conservar idénticos:
        - version
        - event_id
        - nonce
        - ciphertext
        - aad
        - payload_digest

        El commitment NO debe compararse como determinista.
        """
        env1, r1 = self._seal()
        env2, r2 = self._seal()

        deterministic_fields = (
            "version",
            "event_id",
            "nonce",
            "ciphertext",
            "aad",
            "payload_digest",
        )

        for field in deterministic_fields:
            with self.subTest(field=field):
                self.assertEqual(
                    env1[field],
                    env2[field],
                )

        self.assertNotEqual(
            r1,
            r2,
        )

    # ---------------------------------------------------------
    # PEDERSEN RANDOMNESS / COMMITMENT
    # ---------------------------------------------------------

    def test_independent_sealing_uses_distinct_pedersen_randomness(self):
        env1, r1 = self._seal()
        env2, r2 = self._seal()

        self.assertNotEqual(
            r1,
            r2,
            "seal() no debe reutilizar r",
        )

        self.assertNotEqual(
            env1["pedersen_commitment"],
            env2["pedersen_commitment"],
            "Commitments independientes deben diferir",
        )

    def test_pedersen_commitment_has_canonical_width(self):
        env, _ = self._seal()

        commitment = env[
            "pedersen_commitment"
        ]

        self.assertEqual(
            len(commitment),
            COMMITMENT_HEX_LENGTH,
        )

        self.assertEqual(
            len(commitment),
            512,
        )

        self.assertEqual(
            len(commitment) % 2,
            0,
        )

        commitment_int = int(
            commitment,
            16,
        )

        self.assertGreater(
            commitment_int,
            0,
        )

        self.assertLess(
            commitment_int,
            P,
        )

    def test_pedersen_commitment_is_valid_hex(self):
        env, _ = self._seal()

        commitment = env[
            "pedersen_commitment"
        ]

        self.assertEqual(
            commitment,
            commitment.lower(),
        )

        self.assertTrue(
            all(
                char in "0123456789abcdef"
                for char in commitment
            )
        )

    # ---------------------------------------------------------
    # PAYLOAD / DIGEST INTEGRITY
    # ---------------------------------------------------------

    def test_payload_tampering(self):
        env, r = self._seal()

        corrupted = bytearray(
            self.ciphertext
        )

        corrupted[0] ^= 0xFF

        env["ciphertext"] = bytes(
            corrupted
        ).hex()

        self.assertFalse(
            verify(env, r=r)
        )

    def test_aad_tampering(self):
        env, r = self._seal()

        env["aad"] = (
            b"wrong-aad"
        ).hex()

        self.assertFalse(
            verify(env, r=r)
        )

    def test_nonce_tampering(self):
        env, r = self._seal()

        env["nonce"] = (
            "00" * 12
        )

        self.assertFalse(
            verify(env, r=r)
        )

    def test_digest_mismatch(self):
        env, r = self._seal()

        original_digest = env[
            "payload_digest"
        ]

        env["payload_digest"] = (
            "00" * 32
        )

        self.assertNotEqual(
            original_digest,
            env["payload_digest"],
        )

        self.assertFalse(
            verify(env, r=r)
        )

    def test_event_id_tampering(self):
        env, r = self._seal()

        original_event_id = env[
            "event_id"
        ]

        env["event_id"] = (
            "evt-tampered"
        )

        self.assertNotEqual(
            original_event_id,
            env["event_id"],
        )

        self.assertFalse(
            verify(env, r=r)
        )

    # ---------------------------------------------------------
    # COMMITMENT INTEGRITY
    # ---------------------------------------------------------

    def test_commitment_mismatch(self):
        env, r = self._seal()

        original = int(
            env["pedersen_commitment"],
            16,
        )

        modified = (
            original + 1
        ) % P

        if modified == 0:
            modified = 1

        env["pedersen_commitment"] = format(
            modified,
            f"0{COMMITMENT_HEX_LENGTH}x",
        )

        self.assertFalse(
            verify(env, r=r)
        )

    def test_wrong_pedersen_opening(self):
        env, r = self._seal()

        wrong_r = (
            r + 1
        ) % Q

        self.assertNotEqual(
            r,
            wrong_r,
        )

        self.assertFalse(
            verify(
                env,
                r=wrong_r,
            )
        )

    def test_invalid_pedersen_opening_type(self):
        env, _ = self._seal()

        self.assertFalse(
            verify(
                env,
                r="invalid",
            )
        )

    def test_invalid_pedersen_opening_bounds(self):
        env, r = self._seal()

        self.assertFalse(
            verify(
                env,
                r=Q,
            )
        )

        self.assertFalse(
            verify(
                env,
                r=-1,
            )
        )

    # ---------------------------------------------------------
    # STRUCTURAL VALIDATION
    # ---------------------------------------------------------

    def test_invalid_version(self):
        env, _ = self._seal()

        self.assertEqual(
            env["version"],
            CURRENT_VERSION,
        )

        env["version"] = 99

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_hexadecimal_fields(self):
        env, _ = self._seal()

        env["nonce"] = (
            "not-hex-string!!"
        )

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_nonce_length(self):
        env, _ = self._seal()

        env["nonce"] = "00"

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_nonce_odd_hex_length(self):
        env, _ = self._seal()

        env["nonce"] = "0" * 23

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_digest_length(self):
        env, _ = self._seal()

        env["payload_digest"] = "00"

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_digest_odd_hex_length(self):
        env, _ = self._seal()

        env["payload_digest"] = "0" * 63

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_commitment_length(self):
        env, _ = self._seal()

        env["pedersen_commitment"] = "00"

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_invalid_commitment_odd_hex_length(self):
        env, _ = self._seal()

        env["pedersen_commitment"] = (
            "0" * 511
        )

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_commitment_out_of_group_range(self):
        env, _ = self._seal()

        env["pedersen_commitment"] = (
            "0" * 512
        )

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_unexpected_fields(self):
        env, _ = self._seal()

        env["extra_field"] = (
            "injected"
        )

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    def test_missing_required_fields(self):
        env, _ = self._seal()

        del env["aad"]

        with self.assertRaises(
            ValueError
        ):
            serialize(env)

        self.assertFalse(
            verify(env)
        )

    # ---------------------------------------------------------
    # EVENT IDENTIFIERS
    # ---------------------------------------------------------

    def test_different_event_id_changes_digest(self):
        env1, _ = self._seal(
            event_id="evt-A"
        )

        env2, _ = self._seal(
            event_id="evt-B"
        )

        self.assertNotEqual(
            env1["payload_digest"],
            env2["payload_digest"],
        )

    def test_different_event_id_invalidates_original_commitment(self):
        env, r = self._seal()

        original_digest = env[
            "payload_digest"
        ]

        env["event_id"] = (
            "evt-mutated"
        )

        self.assertEqual(
            len(original_digest),
            64,
        )

        self.assertFalse(
            verify(env, r=r)
        )

    # ---------------------------------------------------------
    # EMPTY / UNICODE / LARGE PAYLOADS
    # ---------------------------------------------------------

    def test_empty_payload(self):
        empty_plaintext = b""

        nonce, ciphertext = encrypt(
            self.key,
            empty_plaintext,
            self.aad,
        )

        env, r = seal(
            "evt-empty",
            nonce,
            ciphertext,
            self.aad,
        )

        self.assertTrue(
            verify(
                env,
                r=r,
            )
        )

        recovered = decrypt(
            self.key,
            nonce,
            ciphertext,
            self.aad,
        )

        self.assertEqual(
            recovered,
            empty_plaintext,
        )

    def test_unicode_utf8(self):
        unicode_plaintext = (
            "Café con ñoñería y "
            "lógica convexa 🚀"
        ).encode("utf-8")

        nonce, ciphertext = encrypt(
            self.key,
            unicode_plaintext,
            self.aad,
        )

        env, r = seal(
            "evt-unicode",
            nonce,
            ciphertext,
            self.aad,
        )

        self.assertTrue(
            verify(
                env,
                r=r,
            )
        )

        serialized = serialize(
            env
        )

        deserialized = deserialize(
            serialized
        )

        self.assertEqual(
            env,
            deserialized,
        )

        recovered = decrypt(
            self.key,
            nonce,
            ciphertext,
            self.aad,
        )

        self.assertEqual(
            recovered,
            unicode_plaintext,
        )

    def test_large_payload(self):
        large_plaintext = (
            b"A" * 65536
        )

        nonce, ciphertext = encrypt(
            self.key,
            large_plaintext,
            self.aad,
        )

        env, r = seal(
            "evt-large",
            nonce,
            ciphertext,
            self.aad,
        )

        self.assertTrue(
            verify(
                env,
                r=r,
            )
        )

        recovered = decrypt(
            self.key,
            nonce,
            ciphertext,
            self.aad,
        )

        self.assertEqual(
            recovered,
            large_plaintext,
        )

    # ---------------------------------------------------------
    # MALFORMED INPUT
    # ---------------------------------------------------------

    def test_deserialize_non_json(self):
        with self.assertRaises(
            ValueError
        ):
            deserialize(
                "{invalid-json"
            )

    def test_deserialize_invalid_utf8(self):
        with self.assertRaises(
            ValueError
        ):
            deserialize(
                b"\xff\xfe\xfd"
            )

    def test_serialize_non_dict(self):
        with self.assertRaises(
            TypeError
        ):
            serialize(
                "not-a-dict"
            )

    def test_deserialize_missing_field(self):
        env, _ = self._seal()

        del env["aad"]

        serialized = (
            __import__("json").dumps(
                env
            )
        )

        with self.assertRaises(
            ValueError
        ):
            deserialize(serialized)

    # ---------------------------------------------------------
    # CANONICAL ORDERING
    # ---------------------------------------------------------

    def test_dictionary_insertion_order_does_not_change_serialization(self):
        env, _ = self._seal()

        reordered = {
            "pedersen_commitment":
                env["pedersen_commitment"],
            "aad":
                env["aad"],
            "ciphertext":
                env["ciphertext"],
            "event_id":
                env["event_id"],
            "payload_digest":
                env["payload_digest"],
            "nonce":
                env["nonce"],
            "version":
                env["version"],
            "digest":
                env["digest"],
        }

        self.assertEqual(
            serialize(env),
            serialize(reordered),
        )


if __name__ == "__main__":
    unittest.main()
