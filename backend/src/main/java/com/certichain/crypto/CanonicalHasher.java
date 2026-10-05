package com.certichain.crypto;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class CanonicalHasher {

    public static final String INSTITUTION = "Demo University";

    private CanonicalHasher() {
    }

    public static String canonical(String certificateId, String studentName, String degree, String issueDate, String grade) {
        return String.join("|", certificateId, studentName, degree, issueDate, grade, INSTITUTION);
    }

    public static String sha256(String value) {
        return sha256(value.getBytes(StandardCharsets.UTF_8));
    }

    public static String sha256(byte[] value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value);
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte current : digest) {
                hex.append(String.format("%02x", current));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
