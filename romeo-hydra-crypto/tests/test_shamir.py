import unittest

from core.shamir import split, reconstruct


class TestShamir(unittest.TestCase):

    def test_threshold_two_of_three(self):

        secret = 123456789

        shares = split(
            secret,
            n=3,
            threshold=2,
        )

        recovered = reconstruct(
            shares[:2]
        )

        self.assertEqual(
            recovered,
            secret,
        )

    def test_all_three_reconstruct(self):

        secret = 987654321

        shares = split(
            secret,
            n=3,
            threshold=2,
        )

        recovered = reconstruct(
            shares
        )

        self.assertEqual(
            recovered,
            secret,
        )


if __name__ == "__main__":
    unittest.main()
