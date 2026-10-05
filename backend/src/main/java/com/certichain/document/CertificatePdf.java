package com.certichain.document;

import com.certichain.certificate.CertificateEntity;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.student.StudentEntity;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

public final class CertificatePdf {

    private CertificatePdf() {
    }

    public static byte[] render(CertificateEntity certificate, StudentEntity student) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDType1Font title = new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD);
            PDType1Font body = new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.setStrokingColor(0.13f, 0.42f, 0.29f);
                content.setLineWidth(1.4f);
                content.addRect(36, 36, page.getMediaBox().getWidth() - 72, page.getMediaBox().getHeight() - 72);
                content.stroke();
                content.beginText();
                content.setFont(title, 28);
                content.newLineAtOffset(64, 740);
                content.setLeading(22);
                content.showText(safe(CanonicalHasher.INSTITUTION));
                content.setFont(body, 14);
                content.newLine();
                content.newLine();
                content.showText(safe(certificate.getCertificateType()) + " certificate");
                content.newLine();
                content.newLine();
                content.showText("This record certifies that " + safe(student.getName()));
                content.newLine();
                content.showText("has completed " + safe(certificate.getDegree()) + ".");
                content.newLine();
                content.newLine();
                line(content, "Certificate ID: " + certificate.getId());
                line(content, "Student: " + safe(student.getName()));
                line(content, "Credential: " + safe(certificate.getDegree()));
                line(content, "Issue date: " + certificate.getIssueDate());
                line(content, "Grade: " + safe(certificate.getGrade()));
                line(content, "Fingerprint: " + certificate.getDocumentHash());
                content.endText();
            }
            document.save(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("The certificate PDF could not be written", exception);
        }
    }

    private static void line(PDPageContentStream content, String value) throws IOException {
        content.showText(value);
        content.newLine();
    }

    private static String safe(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("[^\\x20-\\x7E]", "");
    }
}
