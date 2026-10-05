package com.certichain.crypto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CanonicalHasherTest {

    @Test
    void matchesTheFrontendFingerprint() {
        assertThat(CanonicalHasher.sha256(CanonicalHasher.canonical(
                "CERT-2026-001245", "Vanshika Nimwal", "B.Tech Computer Science", "2026-09-30", "8.2")))
                .isEqualTo("0290186015a2878d7a27ccd0e04ce28d281f77a05c401f9ca0d70522e81ebb24");
        assertThat(CanonicalHasher.sha256(CanonicalHasher.canonical(
                "CERT-2026-001188", "Arjun Mehta", "B.Tech Computer Science", "2026-09-30", "8.7")))
                .isEqualTo("698db744358275c7c15e1cf06f7900e2d2bf374427c2118a276ae28a0946b054");
        assertThat(CanonicalHasher.sha256(CanonicalHasher.canonical(
                "CERT-2026-000902", "Meera Iyer", "B.Tech Electronics and Communication", "2026-06-12", "7.9")))
                .isEqualTo("54ef3be2c656a06135c78e0cc414ba140f6e563d39b7b0645114ed5098e45d7b");
    }
}
