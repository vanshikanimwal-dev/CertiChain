package com.certichain.document;

import com.certichain.certificate.CertificateEntity;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.student.StudentEntity;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

@Service
public class DocumentScanService {

    private final OcrClient ocr;

    public DocumentScanService(OcrClient ocr) {
        this.ocr = ocr;
    }

    public ScanOutcome scan(CertificateEntity certificate, StudentEntity student, byte[] fileBytes) {
        Extraction extraction = extract(fileBytes);
        return new ScanOutcome(extraction.note(), compareText(certificate, student, extraction.text()));
    }

    public static List<FieldComparison> compareText(CertificateEntity certificate, StudentEntity student, String text) {
        String[] pipe = pipeParts(text);
        String foundId = first(labeled(text, "Certificate ID"), pipe, 0);
        String foundName = first(labeled(text, "Student"), pipe, 1);
        String foundDegree = first(labeled(text, "Credential", "Degree"), pipe, 2);
        String foundDate = first(labeled(text, "Issue date"), pipe, 3);
        String foundGrade = first(labeled(text, "Grade"), pipe, 4);
        String fingerprint = labeled(text, "Fingerprint");
        if (fingerprint.isBlank() && pipe != null) {
            fingerprint = CanonicalHasher.sha256(Arrays.stream(pipe).map(String::trim).reduce((left, right) -> left + "|" + right).orElse(""));
        }
        String rebuilt = rebuildFingerprint(foundId, foundName, foundDegree, foundDate, foundGrade);
        if (!certificate.getDocumentHash().equalsIgnoreCase(fingerprint) && certificate.getDocumentHash().equalsIgnoreCase(rebuilt)) {
            fingerprint = rebuilt;
        }
        List<FieldComparison> fields = new ArrayList<>();
        fields.add(compareField("Certificate ID", certificate.getId(), foundId));
        fields.add(compareField("Student", student.getName(), foundName));
        fields.add(compareField("Credential", certificate.getDegree(), foundDegree));
        fields.add(compareField("Issue date", certificate.getIssueDate().toString(), foundDate));
        fields.add(compareField("Grade", certificate.getGrade(), foundGrade));
        fields.add(compareField("Fingerprint", certificate.getDocumentHash(), fingerprint));
        return fields;
    }

    private Extraction extract(byte[] fileBytes) {
        if (isPdf(fileBytes)) {
            return new Extraction(pdfText(fileBytes), "Text was read from the PDF. The fingerprint on the certificate stays the integrity proof.");
        }
        if (isMostlyText(fileBytes)) {
            return new Extraction(
                    new String(fileBytes, StandardCharsets.UTF_8),
                    "Text was read from the file. The fingerprint on the certificate stays the integrity proof.");
        }
        try {
            return new Extraction(
                    ocr.extract(fileBytes),
                    "Text was read from the image. The fingerprint is calculated from the fields that were read.");
        } catch (RuntimeException exception) {
            return new Extraction("", "The image could not be read. Upload the issued PDF or the text record.");
        }
    }

    static String pdfText(byte[] fileBytes) {
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException exception) {
            return "";
        }
    }

    private static boolean isPdf(byte[] fileBytes) {
        return fileBytes.length > 4 && fileBytes[0] == '%' && fileBytes[1] == 'P' && fileBytes[2] == 'D' && fileBytes[3] == 'F';
    }

    private static boolean isMostlyText(byte[] fileBytes) {
        if (fileBytes.length == 0) {
            return true;
        }
        int weird = 0;
        for (byte value : fileBytes) {
            int current = value & 0xff;
            if (current == 0) {
                return false;
            }
            if (current < 9 || (current > 13 && current < 32)) {
                weird++;
            }
        }
        return weird * 20 < fileBytes.length;
    }

    private static String[] pipeParts(String text) {
        for (String line : text.split("\\R")) {
            if (!line.contains("|")) {
                continue;
            }
            String[] parts = line.trim().split("\\|", -1);
            if (parts.length >= 5) {
                return parts;
            }
        }
        return null;
    }

    private static String rebuildFingerprint(String id, String name, String degree, String date, String grade) {
        if (id.isBlank() || name.isBlank() || degree.isBlank() || date.isBlank() || grade.isBlank()) {
            return "";
        }
        return CanonicalHasher.sha256(CanonicalHasher.canonical(id, name, degree, date, grade));
    }

    private static String first(String labeled, String[] pipe, int index) {
        if (!labeled.isBlank()) {
            return labeled;
        }
        if (pipe != null && index < pipe.length) {
            return pipe[index].trim();
        }
        return "";
    }

    private static String labeled(String text, String... labels) {
        for (String line : text.split("\\R")) {
            String trimmed = line.trim();
            for (String label : labels) {
                if (trimmed.regionMatches(true, 0, label, 0, label.length()) && trimmed.substring(label.length()).stripLeading().startsWith(":")) {
                    return trimmed.substring(label.length()).replaceFirst("^[:\\s]+", "").trim();
                }
            }
        }
        return "";
    }

    private static FieldComparison compareField(String field, String expected, String found) {
        String actual = found == null ? "" : found.trim();
        return new FieldComparison(field, expected, actual, !actual.isBlank() && expected.equalsIgnoreCase(actual));
    }

    public record FieldComparison(String field, String expected, String found, boolean match) {
    }

    public record ScanOutcome(String note, List<FieldComparison> fields) {
    }

    private record Extraction(String text, String note) {
    }
}
