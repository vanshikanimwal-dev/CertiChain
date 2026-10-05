package com.certichain.api;

import com.certichain.blockchain.ChainService;
import com.certichain.certificate.CertificateEntity;
import com.certichain.certificate.CertificateRepository;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.document.CertificatePdf;
import com.certichain.document.CertificateStorage;
import com.certichain.document.DocumentScanService;
import com.certichain.student.StudentEntity;
import com.certichain.student.StudentRepository;
import com.certichain.verification.VerificationLogEntity;
import com.certichain.verification.VerificationLogRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class RecordsController {

    private final StudentRepository students;
    private final CertificateRepository certificates;
    private final VerificationLogRepository logs;
    private final ChainService chain;
    private final CertificateStorage storage;
    private final DocumentScanService scanner;

    public RecordsController(
            StudentRepository students,
            CertificateRepository certificates,
            VerificationLogRepository logs,
            ChainService chain,
            CertificateStorage storage,
            DocumentScanService scanner) {
        this.students = students;
        this.certificates = certificates;
        this.logs = logs;
        this.chain = chain;
        this.storage = storage;
        this.scanner = scanner;
    }

    @GetMapping("/api/students")
    public List<StudentResponse> listStudents() {
        return students.findAll().stream().map(StudentResponse::from).toList();
    }

    @PostMapping("/api/students")
    public StudentResponse createStudent(@Valid @RequestBody StudentRequest request) {
        StudentEntity student = new StudentEntity();
        student.setId("stu-" + UUID.randomUUID().toString().substring(0, 8));
        student.setName(request.name().trim());
        student.setStudentNumber(request.studentNumber().trim());
        student.setDepartment(request.department().trim());
        student.setCourse(request.course().trim());
        student.setGraduationYear(request.graduationYear());
        return StudentResponse.from(students.save(student));
    }

    @GetMapping("/api/certificates")
    public List<CertificateResponse> listCertificates() {
        return certificates.findAllByOrderByIssueDateDesc().stream().map(CertificateResponse::from).toList();
    }

    @PostMapping("/api/certificates")
    public CertificateResponse saveCertificate(@Valid @RequestBody CertificateRequest request) {
        StudentEntity student = students.findById(request.studentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a student before saving the certificate."));
        String id = request.id() == null || request.id().isBlank()
                ? nextCertificateId()
                : request.id();
        CertificateEntity certificate = certificates.findById(id).orElseGet(CertificateEntity::new);
        certificate.setId(id);
        certificate.setStudentId(student.getId());
        certificate.setCertificateType(request.certificateType().trim());
        certificate.setDegree(request.degree().trim());
        certificate.setDepartment(request.department().trim());
        certificate.setIssueDate(LocalDate.parse(request.issueDate()));
        certificate.setGrade(request.grade().trim());
        certificate.setStatus(request.status());
        certificate.setRevokedReason(certificate.getRevokedReason() == null ? "" : certificate.getRevokedReason());
        if ("ISSUED".equals(request.status())) {
            certificate.setDocumentHash(CanonicalHasher.sha256(CanonicalHasher.canonical(
                    id, student.getName(), certificate.getDegree(), request.issueDate(), certificate.getGrade())));
            storage.store(certificate, CertificatePdf.render(certificate, student));
            chain.sync(certificate);
        } else {
            certificate.setDocumentHash("");
            certificate.setFileHash("");
            certificate.setFileKey("");
            certificate.setChainStatus(ChainService.NOT_ANCHORED);
            certificate.setChainTxHash("");
            certificate.setChainNetwork("");
        }
        return CertificateResponse.from(certificates.save(certificate));
    }

    @PostMapping("/api/certificates/{id}/revoke")
    public CertificateResponse revoke(@PathVariable String id, @Valid @RequestBody RevokeRequest request) {
        CertificateEntity certificate = certificates.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate was not found."));
        if (!"ISSUED".equals(certificate.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only an issued certificate can be revoked.");
        }
        certificate.setStatus("REVOKED");
        certificate.setRevokedReason(request.reason().trim());
        chain.sync(certificate);
        return CertificateResponse.from(certificates.save(certificate));
    }

    @GetMapping("/api/verification-logs")
    public List<LogResponse> listLogs() {
        return logs.findAllByOrderByVerifiedAtDesc().stream().map(LogResponse::from).toList();
    }

    @GetMapping("/api/public/verify/{id}/document")
    public ResponseEntity<byte[]> document(@PathVariable String id) {
        CertificateEntity certificate = certificates.findById(id)
                .filter(item -> !"DRAFT".equals(item.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No issued certificate uses this ID."));
        StudentEntity student = students.findById(certificate.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student record is missing."));
        byte[] pdf = storage.loadOrCreate(certificate, student);
        certificates.save(certificate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + certificate.getId() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/api/public/verify/{id}")
    public PublicVerification publicVerify(@PathVariable String id) {
        PublicVerification view = readPublic(id);
        writeLog(id, view.status(), "QR_LOOKUP");
        return view;
    }

    @PostMapping("/api/public/verify/{id}/check-file")
    public FileCheckResponse checkFile(@PathVariable String id, @RequestParam("file") MultipartFile file) throws Exception {
        PublicVerification view = readPublic(id);
        if ("NOT_FOUND".equals(view.status())) {
            writeLog(id, "NOT_FOUND", "DOCUMENT_CHECK");
            return new FileCheckResponse("NOT_FOUND", "", view.documentHash());
        }
        CertificateEntity certificate = certificates.findById(id).orElseThrow();
        String fileHash = CanonicalHasher.sha256(file.getBytes());
        boolean matches = fileHash.equals(certificate.getDocumentHash())
                || (!certificate.getFileHash().isBlank() && fileHash.equals(certificate.getFileHash()));
        String result = !matches ? "HASH_MISMATCH" : "REVOKED".equals(certificate.getStatus()) ? "REVOKED" : "VERIFIED";
        writeLog(id, result, "DOCUMENT_CHECK");
        return new FileCheckResponse(result, fileHash, view.documentHash());
    }

    @PostMapping("/api/public/verify/{id}/scan")
    public ScanResponse scan(@PathVariable String id, @RequestParam("file") MultipartFile file) throws Exception {
        CertificateEntity certificate = certificates.findById(id).orElse(null);
        if (certificate == null || "DRAFT".equals(certificate.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No issued certificate uses this ID.");
        }
        StudentEntity student = students.findById(certificate.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student record is missing."));
        DocumentScanService.ScanOutcome outcome = scanner.scan(certificate, student, file.getBytes());
        boolean allMatch = outcome.fields().stream().allMatch(DocumentScanService.FieldComparison::match);
        String result = allMatch && "REVOKED".equals(certificate.getStatus()) ? "REVOKED" : allMatch ? "VERIFIED" : "HASH_MISMATCH";
        writeLog(id, result, "DOCUMENT_CHECK");
        return new ScanResponse(result, outcome.note(), outcome.fields());
    }

    private PublicVerification readPublic(String id) {
        CertificateEntity certificate = certificates.findById(id).orElse(null);
        if (certificate == null || "DRAFT".equals(certificate.getStatus())) {
            return PublicVerification.missing(id);
        }
        StudentEntity student = students.findById(certificate.getStudentId()).orElse(null);
        if (student == null) {
            return PublicVerification.missing(id);
        }
        String status = "REVOKED".equals(certificate.getStatus()) ? "REVOKED" : "VERIFIED";
        return new PublicVerification(
                certificate.getId(),
                status,
                student.getName(),
                student.getStudentNumber(),
                certificate.getDegree(),
                certificate.getDepartment(),
                certificate.getIssueDate().toString(),
                certificate.getGrade(),
                CanonicalHasher.INSTITUTION,
                certificate.getDocumentHash(),
                certificate.getRevokedReason(),
                certificate.getChainStatus(),
                certificate.getChainTxHash(),
                certificate.getChainNetwork());
    }

    private void writeLog(String certificateId, String result, String type) {
        VerificationLogEntity log = new VerificationLogEntity();
        log.setId(UUID.randomUUID());
        log.setCertificateId(certificateId);
        log.setResult(result);
        log.setVerificationType(type);
        log.setVerifiedAt(Instant.now());
        logs.save(log);
    }

    private String nextCertificateId() {
        String prefix = "CERT-" + LocalDate.now().getYear() + "-";
        long sequence = certificates.countByIdStartingWith(prefix) + 1;
        String id;
        do {
            id = prefix + String.format("%06d", sequence);
            sequence++;
        } while (certificates.existsById(id));
        return id;
    }

    public record StudentRequest(
            @NotBlank String name,
            @NotBlank String studentNumber,
            @NotBlank String department,
            @NotBlank String course,
            int graduationYear) {
    }

    public record StudentResponse(String id, String name, String studentNumber, String department, String course, int graduationYear) {
        static StudentResponse from(StudentEntity student) {
            return new StudentResponse(
                    student.getId(),
                    student.getName(),
                    student.getStudentNumber(),
                    student.getDepartment(),
                    student.getCourse(),
                    student.getGraduationYear());
        }
    }

    public record CertificateRequest(
            String id,
            @NotBlank String studentId,
            @NotBlank String certificateType,
            @NotBlank String degree,
            @NotBlank String department,
            @NotBlank String issueDate,
            @NotBlank String grade,
            @NotBlank String status) {
    }

    public record CertificateResponse(
            String id,
            String studentId,
            String certificateType,
            String degree,
            String department,
            String issueDate,
            String grade,
            String status,
            String documentHash,
            String revokedReason,
            String chainStatus,
            String chainTxHash,
            String chainNetwork) {
        static CertificateResponse from(CertificateEntity certificate) {
            return new CertificateResponse(
                    certificate.getId(),
                    certificate.getStudentId(),
                    certificate.getCertificateType(),
                    certificate.getDegree(),
                    certificate.getDepartment(),
                    certificate.getIssueDate().toString(),
                    certificate.getGrade(),
                    certificate.getStatus(),
                    certificate.getDocumentHash(),
                    certificate.getRevokedReason(),
                    certificate.getChainStatus(),
                    certificate.getChainTxHash(),
                    certificate.getChainNetwork());
        }
    }

    public record RevokeRequest(@NotBlank String reason) {
    }

    public record LogResponse(String id, String certificateId, String result, String verificationType, Instant verifiedAt) {
        static LogResponse from(VerificationLogEntity log) {
            return new LogResponse(log.getId().toString(), log.getCertificateId(), log.getResult(), log.getVerificationType(), log.getVerifiedAt());
        }
    }

    public record PublicVerification(
            String certificateId,
            String status,
            String studentName,
            String studentNumber,
            String degree,
            String department,
            String issueDate,
            String grade,
            String institution,
            String documentHash,
            String revokedReason,
            String chainStatus,
            String chainTxHash,
            String chainNetwork) {
        static PublicVerification missing(String id) {
            return new PublicVerification(id, "NOT_FOUND", "", "", "", "", "", "", CanonicalHasher.INSTITUTION, "", "", "", "", "");
        }
    }

    public record FileCheckResponse(String result, String fileHash, String documentHash) {
    }

    public record ScanResponse(String result, String note, List<DocumentScanService.FieldComparison> fields) {
    }
}
