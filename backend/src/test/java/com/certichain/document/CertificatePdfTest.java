package com.certichain.document;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.certichain.certificate.CertificateEntity;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.student.StudentEntity;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class CertificatePdfTest {

    @Test
    void issuedPdfMatchesEveryField() {
        StudentEntity student = new StudentEntity();
        student.setName("Vanshika Nimwal");
        CertificateEntity certificate = new CertificateEntity();
        certificate.setId("CERT-2026-001245");
        certificate.setCertificateType("Degree");
        certificate.setDegree("B.Tech Computer Science");
        certificate.setIssueDate(LocalDate.parse("2026-09-30"));
        certificate.setGrade("8.2");
        certificate.setDocumentHash(CanonicalHasher.sha256(CanonicalHasher.canonical(
                certificate.getId(), student.getName(), certificate.getDegree(), "2026-09-30", certificate.getGrade())));

        byte[] pdf = CertificatePdf.render(certificate, student);
        var fields = DocumentScanService.compareText(certificate, student, DocumentScanService.pdfText(pdf));

        assertTrue(fields.stream().allMatch(DocumentScanService.FieldComparison::match));
    }

    @Test
    void misreadFingerprintStillMatchesWhenTheFieldsAreIntact() {
        CertificateEntity certificate = sample();
        StudentEntity student = student();
        String text = """
                Certificate ID: CERT-2026-001245
                Student: Vanshika Nimwal
                Credential: B.Tech Computer Science
                Issue date: 2026-09-30
                Grade: 8.2
                Fingerprint: not-readable
                """;

        var fields = DocumentScanService.compareText(certificate, student, text);

        assertTrue(fields.stream().allMatch(DocumentScanService.FieldComparison::match));
    }

    @Test
    void changedGradeDoesNotMatch() {
        CertificateEntity certificate = sample();
        StudentEntity student = student();
        String text = """
                Certificate ID: CERT-2026-001245
                Student: Vanshika Nimwal
                Credential: B.Tech Computer Science
                Issue date: 2026-09-30
                Grade: 1.0
                Fingerprint: not-readable
                """;

        var fields = DocumentScanService.compareText(certificate, student, text);

        assertFalse(fields.stream().allMatch(DocumentScanService.FieldComparison::match));
    }

    private static StudentEntity student() {
        StudentEntity student = new StudentEntity();
        student.setName("Vanshika Nimwal");
        return student;
    }

    private static CertificateEntity sample() {
        CertificateEntity certificate = new CertificateEntity();
        certificate.setId("CERT-2026-001245");
        certificate.setCertificateType("Degree");
        certificate.setDegree("B.Tech Computer Science");
        certificate.setIssueDate(LocalDate.parse("2026-09-30"));
        certificate.setGrade("8.2");
        certificate.setDocumentHash(CanonicalHasher.sha256(CanonicalHasher.canonical(
                certificate.getId(), "Vanshika Nimwal", certificate.getDegree(), "2026-09-30", certificate.getGrade())));
        return certificate;
    }
}
