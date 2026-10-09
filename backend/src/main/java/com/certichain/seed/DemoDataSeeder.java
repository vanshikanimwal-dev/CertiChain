package com.certichain.seed;

import com.certichain.blockchain.ChainService;
import com.certichain.certificate.CertificateEntity;
import com.certichain.certificate.CertificateRepository;
import com.certichain.crypto.CanonicalHasher;
import com.certichain.student.StudentEntity;
import com.certichain.student.StudentRepository;
import com.certichain.user.UserAccount;
import com.certichain.user.UserAccountRepository;
import com.certichain.verification.VerificationLogEntity;
import com.certichain.verification.VerificationLogRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@Order(1)
public class DemoDataSeeder implements ApplicationRunner {

    private final UserAccountRepository users;
    private final StudentRepository students;
    private final CertificateRepository certificates;
    private final VerificationLogRepository logs;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            UserAccountRepository users,
            StudentRepository students,
            CertificateRepository certificates,
            VerificationLogRepository logs,
            PasswordEncoder passwordEncoder) {
        this.users = users;
        this.students = students;
        this.certificates = certificates;
        this.logs = logs;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        users.findByEmailIgnoreCase("admin@demouniversity.edu").ifPresent(admin -> {
            admin.setEmail("admin@certichain.local");
            users.save(admin);
        });
        if (users.count() > 0) {
            renameLegacyStudentNumbers();
            refreshFingerprints();
            return;
        }
        UserAccount admin = new UserAccount();
        admin.setId(UUID.randomUUID());
        admin.setEmail("admin@certichain.local");
        admin.setFullName("Institution Admin");
        admin.setRole("INSTITUTION_ADMIN");
        admin.setPasswordHash(passwordEncoder.encode("certichain"));
        users.save(admin);

        StudentEntity vanshika = student("stu-vanshika", "Vanshika Nimwal", "CC2022001", "Computer Science", "B.Tech Computer Science", 2026);
        StudentEntity arjun = student("stu-arjun", "Arjun Mehta", "CC2022044", "Computer Science", "B.Tech Computer Science", 2026);
        StudentEntity meera = student("stu-meera", "Meera Iyer", "CC2022118", "Electronics", "B.Tech Electronics and Communication", 2026);
        students.save(vanshika);
        students.save(arjun);
        students.save(meera);

        certificates.save(issued("CERT-2026-001245", vanshika, "B.Tech Computer Science", "Computer Science", LocalDate.parse("2026-09-30"), "8.2", "ISSUED", ""));
        certificates.save(issued("CERT-2026-001188", arjun, "B.Tech Computer Science", "Computer Science", LocalDate.parse("2026-09-30"), "8.7", "ISSUED", ""));
        certificates.save(issued("CERT-2026-000902", meera, "B.Tech Electronics and Communication", "Electronics", LocalDate.parse("2026-06-12"), "7.9", "REVOKED", "Issued against the wrong program."));

        log("CERT-2026-001245", "VERIFIED", Instant.parse("2026-10-02T08:40:00Z"));
        log("CERT-2026-001188", "VERIFIED", Instant.parse("2026-10-02T11:15:00Z"));
        log("CERT-2026-000902", "REVOKED", Instant.parse("2026-10-03T04:05:00Z"));
    }

    private void renameLegacyStudentNumbers() {
        Map<String, String> numbers = Map.of(
                "DU2022001", "CC2022001",
                "DU2022044", "CC2022044",
                "DU2022118", "CC2022118");
        for (StudentEntity student : students.findAll()) {
            String next = numbers.get(student.getStudentNumber());
            if (next == null) {
                continue;
            }
            student.setStudentNumber(next);
            students.save(student);
        }
    }

    private void refreshFingerprints() {
        for (CertificateEntity certificate : certificates.findAll()) {
            StudentEntity student = students.findById(certificate.getStudentId()).orElse(null);
            if (student == null || certificate.getIssueDate() == null) {
                continue;
            }
            String next = CanonicalHasher.sha256(CanonicalHasher.canonical(
                    certificate.getId(),
                    student.getName(),
                    certificate.getDegree(),
                    certificate.getIssueDate().toString(),
                    certificate.getGrade()));
            if (next.equals(certificate.getDocumentHash())) {
                continue;
            }
            certificate.setDocumentHash(next);
            certificate.setFileHash("");
            certificate.setFileKey("");
            certificate.setChainStatus(ChainService.NOT_ANCHORED);
            certificate.setChainTxHash("");
            certificate.setChainNetwork("");
            certificates.save(certificate);
        }
    }

    private StudentEntity student(String id, String name, String number, String department, String course, int year) {
        StudentEntity student = new StudentEntity();
        student.setId(id);
        student.setName(name);
        student.setStudentNumber(number);
        student.setDepartment(department);
        student.setCourse(course);
        student.setGraduationYear(year);
        return student;
    }

    private CertificateEntity issued(String id, StudentEntity student, String degree, String department, LocalDate date, String grade, String status, String reason) {
        CertificateEntity certificate = new CertificateEntity();
        certificate.setId(id);
        certificate.setStudentId(student.getId());
        certificate.setCertificateType("Degree");
        certificate.setDegree(degree);
        certificate.setDepartment(department);
        certificate.setIssueDate(date);
        certificate.setGrade(grade);
        certificate.setStatus(status);
        certificate.setDocumentHash(CanonicalHasher.sha256(CanonicalHasher.canonical(id, student.getName(), degree, date.toString(), grade)));
        certificate.setRevokedReason(reason);
        certificate.setChainStatus(ChainService.NOT_ANCHORED);
        certificate.setChainTxHash("");
        certificate.setChainNetwork("");
        certificate.setFileHash("");
        certificate.setFileKey("");
        return certificate;
    }

    private void log(String certificateId, String result, Instant when) {
        VerificationLogEntity entry = new VerificationLogEntity();
        entry.setId(UUID.randomUUID());
        entry.setCertificateId(certificateId);
        entry.setResult(result);
        entry.setVerificationType("QR_LOOKUP");
        entry.setVerifiedAt(when);
        logs.save(entry);
    }
}
