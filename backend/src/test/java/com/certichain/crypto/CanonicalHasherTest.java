package com.certichain.crypto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CanonicalHasherTest {

    @Test
    void matchesTheFrontendFingerprint() {
        assertThat(CanonicalHasher.sha256(CanonicalHasher.canonical(
                "CERT-2026-001245", "Vanshika Nimwal", "B.Tech Computer Science", "2026-09-30", "8.2")))
                .isEqualTo("9c4a7f5fd5237c33a74cf22428e82470887398553b94fe7f154460c5640133b0");
        assertThat(CanonicalHasher.sha256(CanonicalHasher.canonical(
                "CERT-2026-001188", "Arjun Mehta", "B.Tech Computer Science", "2026-09-30", "8.7")))
                .isEqualTo("7e27071e1b6c103cad10f7346cffac6b7890ddf7a67b4924010b59f3c0ecc65f");
        assertThat(CanonicalHasher.sha256(CanonicalHasher.canonical(
                "CERT-2026-000902", "Meera Iyer", "B.Tech Electronics and Communication", "2026-06-12", "7.9")))
                .isEqualTo("b766149cf1402fd1b208846cf5f019875a848a9d8454520c8981ed7659b2191f");
    }
}
