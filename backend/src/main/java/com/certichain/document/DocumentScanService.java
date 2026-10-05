package com.certichain.document;

import com.certichain.certificate.CertificateEntity;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.student.StudentEntity;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class DocumentScanService {

    private DocumentScanService() {
    }

    public static List<FieldComparison> compare(CertificateEntity certificate, StudentEntity student, byte[] fileBytes) {
        String text = new String(fileBytes, StandardCharsets.UTF_8);
        boolean binary = text.indexOf('\0') >= 0;
        String foundName = binary ? "" : valueAfter(text, "name");
        String foundDegree = binary ? "" : valueAfter(text, "degree");
        String foundDate = binary ? "" : valueAfter(text, "date");
        String foundGrade = binary ? "" : valueAfter(text, "grade");
        String foundId = binary ? "" : valueAfter(text, "id");
        if (!binary && text.contains("|") && !text.contains("\n")) {
            String[] parts = text.split("\\|", -1);
            if (parts.length >= 5) {
                foundId = parts[0];
                foundName = parts[1];
                foundDegree = parts[2];
                foundDate = parts[3];
                foundGrade = parts[4];
            }
        }
        List<FieldComparison> fields = new ArrayList<>();
        fields.add(compareField("Certificate ID", certificate.getId(), foundId));
        fields.add(compareField("Student", student.getName(), foundName));
        fields.add(compareField("Credential", certificate.getDegree(), foundDegree));
        fields.add(compareField("Issue date", certificate.getIssueDate().toString(), foundDate));
        fields.add(compareField("Grade", certificate.getGrade(), foundGrade));
        fields.add(compareField(
                "Fingerprint",
                certificate.getDocumentHash(),
                binary ? "" : CanonicalHasher.sha256(text.contains("|") ? text.trim() : "")));
        return fields;
    }

    private static FieldComparison compareField(String field, String expected, String found) {
        String actual = found == null ? "" : found.trim();
        return new FieldComparison(field, expected, actual, !actual.isBlank() && expected.equalsIgnoreCase(actual));
    }

    private static String valueAfter(String text, String label) {
        String lower = text.toLowerCase(Locale.ROOT);
        int index = lower.indexOf(label + ":");
        if (index < 0) {
            return "";
        }
        int start = index + label.length() + 1;
        int end = text.indexOf('\n', start);
        return (end < 0 ? text.substring(start) : text.substring(start, end)).trim();
    }

    public record FieldComparison(String field, String expected, String found, boolean match) {
    }
}
