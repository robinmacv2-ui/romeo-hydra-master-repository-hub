import unittest

from core.canonical import digest_object
from core.receipts import (
    GENESIS_HASH,
    create_receipt,
    verify_chain,
)


class TestReceiptChain(unittest.TestCase):

    def make_record_hash(
        self,
        value: str,
    ) -> str:

        return digest_object(
            {
                "event": value,
            }
        )

    def test_valid_chain(self):

        h1 = self.make_record_hash("R1")
        h2 = self.make_record_hash("R2")
        h3 = self.make_record_hash("R3")

        r1 = create_receipt(
            h1,
            GENESIS_HASH,
        )

        r2 = create_receipt(
            h2,
            r1.digest(),
        )

        r3 = create_receipt(
            h3,
            r2.digest(),
        )

        self.assertTrue(
            verify_chain(
                [r1, r2, r3]
            )
        )

    def test_empty_chain_is_invalid(self):

        self.assertFalse(
            verify_chain([])
        )

    def test_broken_link_is_detected(self):

        h1 = self.make_record_hash("R1")
        h2 = self.make_record_hash("R2")
        h3 = self.make_record_hash("R3")

        r1 = create_receipt(
            h1,
            GENESIS_HASH,
        )

        r2 = create_receipt(
            h2,
            r1.digest(),
        )

        r3_fake = create_receipt(
            h3,
            GENESIS_HASH,
        )

        self.assertFalse(
            verify_chain(
                [r1, r2, r3_fake]
            )
        )

    def test_modified_record_hash_changes_digest(self):

        h1 = self.make_record_hash("ORIGINAL")

        r1 = create_receipt(
            h1,
            GENESIS_HASH,
        )

        original_digest = r1.digest()

        h1_modified = self.make_record_hash(
            "MODIFICADO"
        )

        r1_modified = create_receipt(
            h1_modified,
            GENESIS_HASH,
        )

        self.assertNotEqual(
            original_digest,
            r1_modified.digest(),
        )

    def test_chain_breaks_after_previous_receipt_changes(self):

        h1 = self.make_record_hash("R1")
        h2 = self.make_record_hash("R2")

        r1 = create_receipt(
            h1,
            GENESIS_HASH,
        )

        r2 = create_receipt(
            h2,
            r1.digest(),
        )

        # Simulamos que R1 fue sustituido.
        r1_modified = create_receipt(
            self.make_record_hash(
                "R1 MODIFICADO"
            ),
            GENESIS_HASH,
        )

        self.assertFalse(
            verify_chain(
                [r1_modified, r2]
            )
        )

    def test_invalid_hash_is_rejected(self):

        with self.assertRaises(
            ValueError
        ):

            create_receipt(
                "HASH1",
                GENESIS_HASH,
            )


if __name__ == "__main__":
    unittest.main()
