package com.certichain.certificate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "certificates")
public class CertificateEntity {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "certificate_type", nullable = false)
    private String certificateType;

    @Column(nullable = false)
    private String degree;

    @Column(nullable = false)
    private String department;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private String status;

    @Column(name = "document_hash", nullable = false)
    private String documentHash = "";

    @Column(name = "revoked_reason", nullable = false)
    private String revokedReason = "";

    @Column(name = "chain_status", nullable = false)
    private String chainStatus;

    @Column(name = "chain_tx_hash", nullable = false)
    private String chainTxHash = "";

    @Column(name = "chain_network", nullable = false)
    private String chainNetwork = "";

    @Column(name = "file_hash", nullable = false)
    private String fileHash = "";

    @Column(name = "file_key", nullable = false)
    private String fileKey = "";

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getCertificateType() {
        return certificateType;
    }

    public void setCertificateType(String certificateType) {
        this.certificateType = certificateType;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDocumentHash() {
        return documentHash;
    }

    public void setDocumentHash(String documentHash) {
        this.documentHash = documentHash;
    }

    public String getRevokedReason() {
        return revokedReason;
    }

    public void setRevokedReason(String revokedReason) {
        this.revokedReason = revokedReason;
    }

    public String getChainStatus() {
        return chainStatus;
    }

    public void setChainStatus(String chainStatus) {
        this.chainStatus = chainStatus;
    }

    public String getChainTxHash() {
        return chainTxHash;
    }

    public void setChainTxHash(String chainTxHash) {
        this.chainTxHash = chainTxHash;
    }

    public String getChainNetwork() {
        return chainNetwork;
    }

    public void setChainNetwork(String chainNetwork) {
        this.chainNetwork = chainNetwork;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public String getFileKey() {
        return fileKey;
    }

    public void setFileKey(String fileKey) {
        this.fileKey = fileKey;
    }
}
